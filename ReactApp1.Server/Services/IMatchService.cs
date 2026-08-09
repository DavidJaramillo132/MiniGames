namespace ReactApp1.Server.Services;

public interface IMatchService
{
    Task<Models.Match> StartMatchAsync(Guid roomId);
    Task<MoveSubmissionResult> SubmitMoveAsync(
        Guid matchId,
        Guid playerUserId,
        Guid idempotencyKey,
        int turnNumber,
        int cellIndex,
        string symbol);
    Task<MoveSubmissionStatus?> GetIdempotencyStatusAsync(
        Guid matchId,
        Guid playerUserId,
        Guid idempotencyKey,
        int cellIndex);
    Task EndMatchAsync(Guid matchId, Guid? winnerUserId, string? resultJson);
}

public enum MoveSubmissionStatus
{
    Applied,
    Replay,
    IdempotencyKeyReuse,
    TurnAlreadyRecorded
}

public sealed record MoveSubmissionResult(MoveSubmissionStatus Status)
{
    public bool IsAccepted => Status is MoveSubmissionStatus.Applied or MoveSubmissionStatus.Replay;
}
