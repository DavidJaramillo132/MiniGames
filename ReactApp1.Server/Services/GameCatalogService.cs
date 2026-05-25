using Dapper;
using ReactApp1.Server.Data;
using ReactApp1.Server.Models;

namespace ReactApp1.Server.Services;

public sealed class GameCatalogService : IGameCatalogService
{
    private readonly DbConnectionFactory _db;

    static GameCatalogService()
    {
        DefaultTypeMap.MatchNamesWithUnderscores = true;
    }

    public GameCatalogService(DbConnectionFactory db)
    {
        _db = db;
    }

    public async Task<IEnumerable<GameCatalog>> GetAllGamesAsync()
    {
        const string sql = "SELECT * FROM games WHERE is_enabled = true ORDER BY name";

        using var conn = _db.CreateConnection();
        return await conn.QueryAsync<GameCatalog>(sql);
    }

    public async Task<GameCatalog?> GetGameBySlugAsync(string slug)
    {
        const string sql = "SELECT * FROM games WHERE slug = @Slug";

        using var conn = _db.CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<GameCatalog>(sql, new { Slug = slug });
    }
}
