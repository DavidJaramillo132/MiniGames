namespace ReactApp1.Server.Models;

public sealed class Move
{
    public Guid Id { get; set; }
    public Guid MatchId { get; set; }
    public int TurnNumber { get; set; }
    public Guid? PlayerUserId { get; set; }
    public int CellIndex { get; set; }
    public string Symbol { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
