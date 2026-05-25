namespace ReactApp1.Server.Models;

public sealed class GameCatalog
{
    public string Slug { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public bool IsEnabled { get; set; }
    public int MaxPlayers { get; set; }
    public DateTime CreatedAt { get; set; }
}
