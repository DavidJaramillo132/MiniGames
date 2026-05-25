using Dapper;
using ReactApp1.Server.Data;
using ReactApp1.Server.Models;

namespace ReactApp1.Server.Services;

public sealed class MatchService : IMatchService
{
    private readonly DbConnectionFactory _db;

    static MatchService()
    {
        DefaultTypeMap.MatchNamesWithUnderscores = true;
    }

    public MatchService(DbConnectionFactory db)
    {
        _db = db;
    }

    public async Task<Match> StartMatchAsync(Guid roomId)
    {
        const string sql = @"
            INSERT INTO matches (id, room_id, started_at)
            VALUES (@Id, @RoomId, now())
            RETURNING *;";

        await using var conn = _db.CreateConnection();
        return await conn.QuerySingleAsync<Match>(sql, new
        {
            Id = Guid.NewGuid(),
            RoomId = roomId
        });
    }

    public async Task RecordMoveAsync(Guid matchId, Guid? playerUserId, int turnNumber, int cellIndex, string symbol)
    {
        const string sql = @"
            INSERT INTO moves (id, match_id, turn_number, player_user_id, cell_index, symbol, created_at)
            VALUES (@Id, @MatchId, @TurnNumber, @PlayerUserId, @CellIndex, @Symbol, now());";

        await using var conn = _db.CreateConnection();
        await conn.ExecuteAsync(sql, new
        {
            Id = Guid.NewGuid(),
            MatchId = matchId,
            TurnNumber = turnNumber,
            PlayerUserId = playerUserId,
            CellIndex = cellIndex,
            Symbol = symbol
        });
    }

    public async Task EndMatchAsync(Guid matchId, Guid? winnerUserId, string? resultJson)
    {
        const string sql = @"
            UPDATE matches
            SET ended_at = now(),
                winner_user_id = @WinnerUserId,
                result = @Result::jsonb
            WHERE id = @MatchId;";

        await using var conn = _db.CreateConnection();
        await conn.ExecuteAsync(sql, new
        {
            MatchId = matchId,
            WinnerUserId = winnerUserId,
            Result = resultJson
        });
    }
}
