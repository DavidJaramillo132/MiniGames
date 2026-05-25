namespace ReactApp1.Server.Models;

public sealed class PlayerStat
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string GameSlug { get; set; } = string.Empty;
    public int Wins { get; set; }
    public int Losses { get; set; }
    public int Draws { get; set; }
    public int Elo { get; set; } = 1500;
    public DateTime UpdatedAt { get; set; }

    // Joined field
    public string? Username { get; set; }
}
