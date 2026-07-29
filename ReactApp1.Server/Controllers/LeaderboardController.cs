using Microsoft.AspNetCore.Authorization;
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

    [HttpGet("{gameSlug}")]
    public async Task<ActionResult<IEnumerable<LeaderboardEntryDto>>> GetLeaderboard(
        string gameSlug,
        [FromQuery] int limit = 10)
    {
        var entries = await _leaderboardService.GetLeaderboardAsync(gameSlug, limit);

        var dtos = entries.Select((entry, index) => new LeaderboardEntryDto(
            index + 1,
            entry.Username ?? "Anonymous",
            0,
            entry.Wins,
            null));

        return Ok(dtos);
    }

    [Authorize]
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
                new("Matches played", "0", "Play to earn stats"),
            ]));
        }

        var totalMatches = stats.Wins + stats.Losses + stats.Draws;

        return Ok(new PlayerStatsDto(gameSlug, [
            new("Victories", stats.Wins.ToString(), "Total wins"),
            new("Matches played", totalMatches.ToString(), $"{stats.Draws} draws"),
        ]));
    }
}
