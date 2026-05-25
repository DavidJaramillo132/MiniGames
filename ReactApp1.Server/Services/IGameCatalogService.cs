namespace ReactApp1.Server.Services;

public interface IGameCatalogService
{
    Task<IEnumerable<Models.GameCatalog>> GetAllGamesAsync();
    Task<Models.GameCatalog?> GetGameBySlugAsync(string slug);
}
