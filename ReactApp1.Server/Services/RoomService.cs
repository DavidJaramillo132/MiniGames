using Dapper;
using ReactApp1.Server.Data;
using ReactApp1.Server.Models;

namespace ReactApp1.Server.Services;

public sealed class RoomService : IRoomService
{
    private readonly DbConnectionFactory _db;

    static RoomService()
    {
        DefaultTypeMap.MatchNamesWithUnderscores = true;
    }

    public RoomService(DbConnectionFactory db)
    {
        _db = db;
    }

    public async Task<Room> CreateRoomAsync(string gameSlug, string name, string? roomCode, Guid? creatorUserId)
    {
        roomCode ??= Guid.NewGuid().ToString("N")[..8].ToUpperInvariant();

        await using var conn = _db.CreateConnection();
        await conn.OpenAsync();
        await using var tx = await conn.BeginTransactionAsync();

        // Check if the room_code is already taken
        var existing = await conn.QuerySingleOrDefaultAsync<Room>(
            "SELECT * FROM rooms WHERE room_code = @RoomCode;",
            new { RoomCode = roomCode }, tx);

        if (existing is not null)
        {
            if (existing.Status is "finished" or "closed")
            {
                // Reclaim the code by deleting the old inactive room
                await conn.ExecuteAsync(
                    "DELETE FROM rooms WHERE id = @Id;",
                    new { existing.Id }, tx);
            }
            else
            {
                await tx.RollbackAsync();
                throw new InvalidOperationException($"A room with code '{roomCode}' already exists and is still active.");
            }
        }

        const string sql = @"
            INSERT INTO rooms (id, game_slug, name, room_code, status, capacity, current_players, creator_user_id, created_at, updated_at)
            VALUES (@Id, @GameSlug, @Name, @RoomCode, 'waiting', 2, 0, @CreatorUserId, now(), now())
            RETURNING *;";

        var room = await conn.QuerySingleAsync<Room>(sql, new
        {
            Id = Guid.NewGuid(),
            GameSlug = gameSlug,
            Name = name,
            RoomCode = roomCode,
            CreatorUserId = creatorUserId
        }, tx);

        await tx.CommitAsync();
        return room;
    }

    public async Task<IEnumerable<Room>> GetActiveRoomsAsync(string? gameSlug = null)
    {
        var sql = @"
            SELECT r.*, u.username AS creator_username
            FROM rooms r
            LEFT JOIN users u ON r.creator_user_id = u.id
            WHERE r.status IN ('waiting', 'in_game')";

        if (!string.IsNullOrWhiteSpace(gameSlug))
            sql += " AND lower(trim(r.game_slug)) = lower(trim(@GameSlug))";

        sql += " ORDER BY r.created_at DESC;";

        await using var conn = _db.CreateConnection();
        return await conn.QueryAsync<Room>(sql, new { GameSlug = gameSlug });
    }

    public async Task<Room?> GetRoomByCodeAsync(string roomCode)
    {
        const string sql = @"
            SELECT r.*, u.username AS creator_username
            FROM rooms r
            LEFT JOIN users u ON r.creator_user_id = u.id
            WHERE r.room_code = @RoomCode;";

        await using var conn = _db.CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<Room>(sql, new { RoomCode = roomCode });
    }

    public async Task<Room?> GetRoomByIdAsync(Guid roomId)
    {
        const string sql = @"
            SELECT r.*, u.username AS creator_username
            FROM rooms r
            LEFT JOIN users u ON r.creator_user_id = u.id
            WHERE r.id = @RoomId;";

        await using var conn = _db.CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<Room>(sql, new { RoomId = roomId });
    }

    public async Task AddPlayerAsync(Guid roomId, Guid? userId, string connectionId, bool isHost = false)
    {
        const string insertPlayer = @"
            INSERT INTO room_players (id, room_id, user_id, connection_id, is_host, joined_at)
            VALUES (@Id, @RoomId, @UserId, @ConnectionId, @IsHost, now());";

        const string updateCount = @"
            UPDATE rooms SET current_players = current_players + 1, updated_at = now()
            WHERE id = @RoomId;";

        await using var conn = _db.CreateConnection();
        await conn.OpenAsync();
        await using var tx = await conn.BeginTransactionAsync();

        await conn.ExecuteAsync(insertPlayer, new
        {
            Id = Guid.NewGuid(),
            RoomId = roomId,
            UserId = userId,
            ConnectionId = connectionId,
            IsHost = isHost
        }, tx);

        await conn.ExecuteAsync(updateCount, new { RoomId = roomId }, tx);

        await tx.CommitAsync();
    }

    public async Task RemovePlayerByConnectionAsync(string connectionId)
    {
        const string findPlayer = @"
            SELECT * FROM room_players
            WHERE connection_id = @ConnectionId AND left_at IS NULL
            LIMIT 1;";

        const string markLeft = @"
            UPDATE room_players SET left_at = now()
            WHERE id = @Id;";

        const string decrementCount = @"
            UPDATE rooms SET current_players = current_players - 1, updated_at = now()
            WHERE id = @RoomId;";

        await using var conn = _db.CreateConnection();
        await conn.OpenAsync();
        await using var tx = await conn.BeginTransactionAsync();

        var player = await conn.QuerySingleOrDefaultAsync<RoomPlayer>(findPlayer, new { ConnectionId = connectionId }, tx);
        if (player is null)
        {
            await tx.CommitAsync();
            return;
        }

        await conn.ExecuteAsync(markLeft, new { player.Id }, tx);
        await conn.ExecuteAsync(decrementCount, new { player.RoomId }, tx);

        await tx.CommitAsync();
    }

    public async Task<bool> DeleteRoomIfEmptyAsync(Guid roomId)
    {
        const string sql = @"
            DELETE FROM rooms WHERE id = @RoomId AND current_players = 0;";

        await using var conn = _db.CreateConnection();
        await conn.OpenAsync();
        await using var tx = await conn.BeginTransactionAsync();

        var rows = await conn.ExecuteAsync(sql, new { RoomId = roomId }, tx);

        await tx.CommitAsync();
        return rows > 0;
    }

    public async Task UpdateStatusAsync(Guid roomId, string status)
    {
        const string sql = @"
            UPDATE rooms SET status = @Status::room_status, updated_at = now()
            WHERE id = @RoomId;";

        await using var conn = _db.CreateConnection();
        await conn.ExecuteAsync(sql, new { RoomId = roomId, Status = status });
    }
}
