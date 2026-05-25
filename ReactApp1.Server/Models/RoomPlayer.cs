namespace ReactApp1.Server.Models;

public sealed class RoomPlayer
{
    public Guid Id { get; set; }
    public Guid RoomId { get; set; }
    public Guid? UserId { get; set; }
    public string? ConnectionId { get; set; }
    public bool IsHost { get; set; }
    public DateTime JoinedAt { get; set; }
    public DateTime? LeftAt { get; set; }
}
