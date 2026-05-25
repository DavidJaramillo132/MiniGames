using Microsoft.AspNetCore.Mvc;
using ReactApp1.Server.DTOs;
using ReactApp1.Server.Services;

namespace ReactApp1.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LeaderboardController : ControllerBase
{
    private readonly ILeaderboardService _leaderboardService;

    public LeaderboardController(ILeaderboardService leaderboardService)
    {
        _leaderboardService = leaderboardService;
    }

    private static readonly string[] RankColors =
    [
        "#f0bf52",                  // gold
        "#d7d9e2",                  // silver
        "#f08a5b",                  // bronze
        "rgba(255,255,255,0.36)",   // rest
    ];

    [HttpGet("{gameSlug}")]
    public async Task<ActionResult<IEnumerable<LeaderboardEntryDto>>> GetLeaderboard(
        string gameSlug,
        [FromQuery] int limit = 10)
    {
        var entries = await _leaderboardService.GetLeaderboardAsync(gameSlug, limit);

        var dtos = entries.Select((entry, index) => new LeaderboardEntryDto(
            index + 1,
            entry.Username ?? "Anonymous",
            entry.Elo,
            entry.Wins,
            index < RankColors.Length ? RankColors[index] : RankColors[^1]));

        return Ok(dtos);
    }

    [HttpGet("{gameSlug}/me")]
    public async Task<ActionResult<PlayerStatsDto>> GetMyStats(string gameSlug)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var stats = await _leaderboardService.GetPlayerStatsAsync(userId, gameSlug);

        if (stats is null)
        {
            // Return default stats for a player with no history
            return Ok(new PlayerStatsDto(gameSlug, [
                new("Victories", "0", "No matches yet"),
                new("ELO", "1500", "Starting rating"),
                new("Matches played", "0", "Play to earn stats"),
                new("Win streak", "0", "Start playing!"),
            ]));
        }

        var totalMatches = stats.Wins + stats.Losses + stats.Draws;
        var winRate = totalMatches > 0 ? (stats.Wins * 100 / totalMatches) : 0;

        return Ok(new PlayerStatsDto(gameSlug, [
            new("Victories", stats.Wins.ToString(), $"{winRate}% win rate"),
            new("ELO", stats.Elo.ToString(), $"Current rating"),
            new("Matches played", totalMatches.ToString(), $"{stats.Draws} draws"),
            new("Win streak", "—", "Tracking coming soon"),
        ]));
    }
}
