namespace ReactApp1.Server.Models;

public sealed class Match
{
    public Guid Id { get; set; }
    public Guid? RoomId { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public Guid? WinnerUserId { get; set; }
    public string? Result { get; set; } // JSON string
}
