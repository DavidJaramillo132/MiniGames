namespace ReactApp1.Server.Services;

public interface IGameActionService
{
    Task<GameActionSubmissionStatus?> GetIdempotencyStatusAsync(Guid matchId, Guid playerUserId, Guid idempotencyKey, string actionType, string payload);
    Task<GameActionSubmissionStatus> SubmitAsync(Guid matchId, Guid playerUserId, Guid idempotencyKey, int sequenceNumber, string actionType, string payload);
}

public enum GameActionSubmissionStatus
{
    Applied,
    Replay,
    IdempotencyKeyReuse,
    SequenceAlreadyRecorded
}
