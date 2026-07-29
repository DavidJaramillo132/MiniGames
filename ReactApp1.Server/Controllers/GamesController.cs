using Microsoft.AspNetCore.Mvc;
using ReactApp1.Server.DTOs;
using ReactApp1.Server.Services;

namespace ReactApp1.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GamesController : ControllerBase
{
    private readonly IGameCatalogService _gameCatalogService;
    private readonly PresenceTracker _presenceTracker;

    public GamesController(IGameCatalogService gameCatalogService, PresenceTracker presenceTracker)
    {
        _gameCatalogService = gameCatalogService;
        _presenceTracker = presenceTracker;
    }

    // Accent colors per game slug for the frontend
    private static readonly Dictionary<string, string> AccentColors = new()
    {
        ["tic-tac-toe"] = "#534AB7",
        ["memory"] = "#E0A526",
        ["trivia"] = "#4CC9F0",
    };

    [HttpGet]
    public async Task<ActionResult<IEnumerable<GameDto>>> GetGames()
    {
        var games = await _gameCatalogService.GetAllGamesAsync();

        var dtos = games.Select(g => new GameDto(
            g.Slug,
            g.Name,
            GetDescription(g.Slug),
            AccentColors.GetValueOrDefault(g.Slug, "#534AB7"),
             _presenceTracker.GetSnapshot().Games.GetValueOrDefault(g.Slug, 0),
            g.IsEnabled,
            g.IsEnabled ? null : "Coming soon"));

        return Ok(dtos);
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<GameDto>> GetGame(string slug)
    {
        var game = await _gameCatalogService.GetGameBySlugAsync(slug);

        if (game is null)
        {
            return NotFound(new { message = "Game not found." });
        }

        return Ok(new GameDto(
            game.Slug,
            game.Name,
            GetDescription(game.Slug),
            AccentColors.GetValueOrDefault(game.Slug, "#534AB7"),
             _presenceTracker.GetSnapshot().Games.GetValueOrDefault(game.Slug, 0),
            game.IsEnabled,
            game.IsEnabled ? null : "Coming soon"));
    }

    private static string GetDescription(string slug) => slug switch
    {
        "tic-tac-toe" => "Tres en raya clásico",
        "memory" => "Encuentra las parejas ocultas",
        "trivia" => "Demuestra tu conocimiento en tiempo real",
        _ => "Juego multijugador en tiempo real"
    };
}
