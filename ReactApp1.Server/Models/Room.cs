namespace ReactApp1.Server.Models;

public sealed class Room
{
    public Guid Id { get; set; }
    public string GameSlug { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string RoomCode { get; set; } = string.Empty;
    public string Status { get; set; } = "waiting"; // waiting, in_game, finished, closed
    public int Capacity { get; set; } = 2;
    public int CurrentPlayers { get; set; }
    public Guid? CreatorUserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime? ClosedAt { get; set; }

    // Joined field (not stored directly in rooms table)
    public string? CreatorUsername { get; set; }
}
