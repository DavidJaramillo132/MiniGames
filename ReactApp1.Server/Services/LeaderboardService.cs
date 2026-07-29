using Dapper;
using ReactApp1.Server.Data;
using ReactApp1.Server.Models;

namespace ReactApp1.Server.Services;

public sealed class LeaderboardService : ILeaderboardService
{
    private readonly DbConnectionFactory _db;

    static LeaderboardService()
    {
        DefaultTypeMap.MatchNamesWithUnderscores = true;
    }

    public LeaderboardService(DbConnectionFactory db)
    {
        _db = db;
    }

    public async Task<IEnumerable<PlayerStat>> GetLeaderboardAsync(string gameSlug, int limit = 10)
    {
        const string sql = @"
            SELECT ps.*, u.username
            FROM player_stats ps
            JOIN users u ON ps.user_id = u.id
            WHERE ps.game_slug = @GameSlug
            ORDER BY ps.wins DESC
            LIMIT @Limit;";

        await using var conn = _db.CreateConnection();
        return await conn.QueryAsync<PlayerStat>(sql, new { GameSlug = gameSlug, Limit = limit });
    }

    public async Task<PlayerStat?> GetPlayerStatsAsync(Guid userId, string gameSlug)
    {
        const string sql = @"
            SELECT ps.*, u.username
            FROM player_stats ps
            JOIN users u ON ps.user_id = u.id
            WHERE ps.user_id = @UserId AND ps.game_slug = @GameSlug;";

        await using var conn = _db.CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<PlayerStat>(sql, new { UserId = userId, GameSlug = gameSlug });
    }

    public async Task UpdateStatsAfterMatchAsync(string gameSlug, Guid? winnerUserId, Guid? loserUserId, bool isDraw)
    {
        // UPSERT template: inserts a new row or updates the existing one on conflict.
        const string upsertSql = @"
            INSERT INTO player_stats (id, user_id, game_slug, wins, losses, draws, elo, updated_at)
            VALUES (@Id, @UserId, @GameSlug, @Wins, @Losses, @Draws, @Elo, now())
            ON CONFLICT (user_id, game_slug) DO UPDATE
            SET wins    = player_stats.wins    + @Wins,
                losses  = player_stats.losses  + @Losses,
                draws   = player_stats.draws   + @Draws,
                elo     = player_stats.elo     + @EloChange,
                updated_at = now();";

        await using var conn = _db.CreateConnection();
        await conn.OpenAsync();
        await using var tx = await conn.BeginTransactionAsync();

        if (isDraw)
        {
            // Both players get a draw, no ELO change
            if (winnerUserId.HasValue)
            {
                await conn.ExecuteAsync(upsertSql, new
                {
                    Id = Guid.NewGuid(),
                    UserId = winnerUserId.Value,
                    GameSlug = gameSlug,
                    Wins = 0, Losses = 0, Draws = 1,
                    Elo = 1500, EloChange = 0
                }, tx);
            }

            if (loserUserId.HasValue)
            {
                await conn.ExecuteAsync(upsertSql, new
                {
                    Id = Guid.NewGuid(),
                    UserId = loserUserId.Value,
                    GameSlug = gameSlug,
                    Wins = 0, Losses = 0, Draws = 1,
                    Elo = 1500, EloChange = 0
                }, tx);
            }
        }
        else
        {
            // Winner: +1 win, +25 ELO
            if (winnerUserId.HasValue)
            {
                await conn.ExecuteAsync(upsertSql, new
                {
                    Id = Guid.NewGuid(),
                    UserId = winnerUserId.Value,
                    GameSlug = gameSlug,
                    Wins = 1, Losses = 0, Draws = 0,
                    Elo = 1525, EloChange = 25
                }, tx);
            }

            // Loser: +1 loss, -25 ELO
            if (loserUserId.HasValue)
            {
                await conn.ExecuteAsync(upsertSql, new
                {
                    Id = Guid.NewGuid(),
                    UserId = loserUserId.Value,
                    GameSlug = gameSlug,
                    Wins = 0, Losses = 1, Draws = 0,
                    Elo = 1475, EloChange = -25
                }, tx);
            }
        }

        await tx.CommitAsync();
    }
}
