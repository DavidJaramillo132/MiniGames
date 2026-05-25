namespace ReactApp1.Server.Services;

public interface IRoomService
{
    Task<Models.Room> CreateRoomAsync(string gameSlug, string name, string? roomCode, Guid? creatorUserId);
    Task<IEnumerable<Models.Room>> GetActiveRoomsAsync(string? gameSlug = null);
    Task<Models.Room?> GetRoomByCodeAsync(string roomCode);
    Task<Models.Room?> GetRoomByIdAsync(Guid roomId);
    Task AddPlayerAsync(Guid roomId, Guid? userId, string connectionId, bool isHost = false);
    Task RemovePlayerByConnectionAsync(string connectionId);
    Task<bool> DeleteRoomIfEmptyAsync(Guid roomId);
    Task UpdateStatusAsync(Guid roomId, string status);
}
