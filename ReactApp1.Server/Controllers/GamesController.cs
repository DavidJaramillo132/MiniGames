using Microsoft.AspNetCore.Mvc;
using ReactApp1.Server.DTOs;
using ReactApp1.Server.Services;

namespace ReactApp1.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GamesController : ControllerBase
{
    private readonly IGameCatalogService _gameCatalogService;

    public GamesController(IGameCatalogService gameCatalogService)
    {
        _gameCatalogService = gameCatalogService;
    }

    // Accent colors per game slug for the frontend
    private static readonly Dictionary<string, string> AccentColors = new()
    {
        ["tic-tac-toe"] = "#534AB7",
        // Future games:
        // ["memory"] = "#E0A526",
        // ["trivia"] = "#b7734a",
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
            0, // playersOnline — will be computed from active connections later
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
            0,
            game.IsEnabled,
            game.IsEnabled ? null : "Coming soon"));
    }

    private static string GetDescription(string slug) => slug switch
    {
        "tic-tac-toe" => "Tres en raya clásico",
        // "memory" => "Encuentra las parejas ocultas",
        // "trivia" => "Demuestra tu conocimiento",
        _ => "Juego multijugador en tiempo real"
    };
}
