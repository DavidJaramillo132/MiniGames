namespace ReactApp1.Server.Services;

public interface ILeaderboardService
{
    Task<IEnumerable<Models.PlayerStat>> GetLeaderboardAsync(string gameSlug, int limit = 10);
    Task<Models.PlayerStat?> GetPlayerStatsAsync(Guid userId, string gameSlug);
    Task UpdateStatsAfterMatchAsync(string gameSlug, Guid? winnerUserId, Guid? loserUserId, bool isDraw);
}
