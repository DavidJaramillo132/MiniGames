using Dapper;
using Npgsql;
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

    public async Task<MoveSubmissionResult> SubmitMoveAsync(
        Guid matchId,
        Guid playerUserId,
        Guid idempotencyKey,
        int turnNumber,
        int cellIndex,
        string symbol)
    {
        const string existingMoveSql = @"
            SELECT turn_number, cell_index, symbol
            FROM moves
            WHERE match_id = @MatchId
              AND player_user_id = @PlayerUserId
              AND idempotency_key = @IdempotencyKey
            FOR UPDATE;";
        const string insertMoveSql = @"
            INSERT INTO moves (id, match_id, turn_number, player_user_id, idempotency_key, cell_index, symbol, created_at)
            VALUES (@Id, @MatchId, @TurnNumber, @PlayerUserId, @IdempotencyKey, @CellIndex, @Symbol, now());";

        await using var conn = _db.CreateConnection();
        await conn.OpenAsync();
        await using var transaction = await conn.BeginTransactionAsync();

        var parameters = new
        {
            MatchId = matchId,
            PlayerUserId = playerUserId,
            IdempotencyKey = idempotencyKey,
            TurnNumber = turnNumber,
            CellIndex = cellIndex,
            Symbol = symbol
        };

        var existingMove = await conn.QuerySingleOrDefaultAsync<PersistedMove>(existingMoveSql, parameters, transaction);
        if (existingMove is not null)
        {
            await transaction.CommitAsync();
            return new MoveSubmissionResult(SameMove(existingMove, cellIndex)
                ? MoveSubmissionStatus.Replay
                : MoveSubmissionStatus.IdempotencyKeyReuse);
        }

        try
        {
            await conn.ExecuteAsync(insertMoveSql, new
            {
                Id = Guid.NewGuid(),
                MatchId = matchId,
                PlayerUserId = playerUserId,
                IdempotencyKey = idempotencyKey,
                TurnNumber = turnNumber,
                CellIndex = cellIndex,
                Symbol = symbol
            }, transaction);
            await transaction.CommitAsync();
            return new MoveSubmissionResult(MoveSubmissionStatus.Applied);
        }
        catch (PostgresException ex) when (ex.SqlState == PostgresErrorCodes.UniqueViolation)
        {
            await transaction.RollbackAsync();

            if (ex.ConstraintName == "moves_match_player_idempotency_key_unique")
            {
                var idempotencyStatus = await GetIdempotencyStatusAsync(matchId, playerUserId, idempotencyKey, cellIndex);
                return new MoveSubmissionResult(idempotencyStatus ?? MoveSubmissionStatus.IdempotencyKeyReuse);
            }

            if (ex.ConstraintName == "moves_match_turn_number_unique")
            {
                return new MoveSubmissionResult(MoveSubmissionStatus.TurnAlreadyRecorded);
            }

            throw;
        }
    }

    public async Task<MoveSubmissionStatus?> GetIdempotencyStatusAsync(
        Guid matchId,
        Guid playerUserId,
        Guid idempotencyKey,
        int cellIndex)
    {
        var existingMove = await GetMoveByIdempotencyKeyAsync(matchId, playerUserId, idempotencyKey);
        if (existingMove is null)
        {
            return null;
        }

        return SameMove(existingMove, cellIndex)
            ? MoveSubmissionStatus.Replay
            : MoveSubmissionStatus.IdempotencyKeyReuse;
    }

    private async Task<PersistedMove?> GetMoveByIdempotencyKeyAsync(Guid matchId, Guid playerUserId, Guid idempotencyKey)
    {
        const string sql = @"
            SELECT turn_number, cell_index, symbol
            FROM moves
            WHERE match_id = @MatchId
              AND player_user_id = @PlayerUserId
              AND idempotency_key = @IdempotencyKey;";

        await using var conn = _db.CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<PersistedMove>(sql, new
        {
            MatchId = matchId,
            PlayerUserId = playerUserId,
            IdempotencyKey = idempotencyKey
        });
    }

    private static bool SameMove(PersistedMove move, int cellIndex) =>
        move.CellIndex == cellIndex;

    private sealed class PersistedMove
    {
        public int CellIndex { get; init; }
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
