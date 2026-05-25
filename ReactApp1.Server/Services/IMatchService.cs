namespace ReactApp1.Server.Services;

public interface IMatchService
{
    Task<Models.Match> StartMatchAsync(Guid roomId);
    Task RecordMoveAsync(Guid matchId, Guid? playerUserId, int turnNumber, int cellIndex, string symbol);
    Task EndMatchAsync(Guid matchId, Guid? winnerUserId, string? resultJson);
}
