using Dapper;

namespace ReactApp1.Server.Data;

public sealed class DatabaseSeeder
{
    private readonly DbConnectionFactory _dbFactory;
    private readonly ILogger<DatabaseSeeder> _logger;

    public DatabaseSeeder(DbConnectionFactory dbFactory, ILogger<DatabaseSeeder> logger)
    {
        _dbFactory = dbFactory;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        await using var connection = _dbFactory.CreateConnection();
        await connection.OpenAsync();

        // Seed game catalog.
        const string sql = @"
            INSERT INTO games (slug, name, is_enabled, max_players)
            VALUES (@Slug, @Name, @IsEnabled, @MaxPlayers)
            ON CONFLICT (slug) DO NOTHING;";

        var games = new[]
        {
            new { Slug = "tic-tac-toe", Name = "Tic-Tac-Toe", IsEnabled = true, MaxPlayers = 2 },
            new { Slug = "trivia", Name = "Trivia Quiz", IsEnabled = true, MaxPlayers = 8 },
            new { Slug = "memory", Name = "Memory Parejas", IsEnabled = true, MaxPlayers = 2 },
        };

        foreach (var game in games)
        {
            var affected = await connection.ExecuteAsync(sql, game);

            if (affected > 0)
            {
                _logger.LogInformation("Seeded game: {Slug}", game.Slug);
            }
        }

        _logger.LogInformation("Database seeding completed.");
    }
}
