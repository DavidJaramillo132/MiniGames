using Dapper;
using Npgsql;
using ReactApp1.Server.Data;

namespace ReactApp1.Server.Services;

public sealed class GameActionService : IGameActionService
{
    private readonly DbConnectionFactory _db;

    public GameActionService(DbConnectionFactory db) => _db = db;

    public async Task<GameActionSubmissionStatus?> GetIdempotencyStatusAsync(Guid matchId, Guid playerUserId, Guid idempotencyKey, string actionType, string payload)
    {
        const string sql = "SELECT action_type = @ActionType AND payload = @Payload::jsonb AS is_replay FROM game_actions WHERE match_id = @MatchId AND player_user_id = @PlayerUserId AND idempotency_key = @IdempotencyKey;";
        await using var conn = _db.CreateConnection();
        var isReplay = await conn.QuerySingleOrDefaultAsync<bool?>(sql, new { MatchId = matchId, PlayerUserId = playerUserId, IdempotencyKey = idempotencyKey, ActionType = actionType, Payload = payload });
        return isReplay is null ? null : isReplay.Value
            ? GameActionSubmissionStatus.Replay
            : GameActionSubmissionStatus.IdempotencyKeyReuse;
    }

    public async Task<GameActionSubmissionStatus> SubmitAsync(Guid matchId, Guid playerUserId, Guid idempotencyKey, int sequenceNumber, string actionType, string payload)
    {
        const string sql = @"INSERT INTO game_actions (id, match_id, sequence_number, player_user_id, idempotency_key, action_type, payload, created_at)
VALUES (@Id, @MatchId, @SequenceNumber, @PlayerUserId, @IdempotencyKey, @ActionType, @Payload::jsonb, now());";
        try
        {
            await using var conn = _db.CreateConnection();
            await conn.ExecuteAsync(sql, new { Id = Guid.NewGuid(), MatchId = matchId, SequenceNumber = sequenceNumber, PlayerUserId = playerUserId, IdempotencyKey = idempotencyKey, ActionType = actionType, Payload = payload });
            return GameActionSubmissionStatus.Applied;
        }
        catch (PostgresException ex) when (ex.SqlState == PostgresErrorCodes.UniqueViolation)
        {
            if (ex.ConstraintName == "game_actions_match_player_idempotency_key_unique")
                return await GetIdempotencyStatusAsync(matchId, playerUserId, idempotencyKey, actionType, payload) ?? GameActionSubmissionStatus.IdempotencyKeyReuse;
            return GameActionSubmissionStatus.SequenceAlreadyRecorded;
        }
    }
}
