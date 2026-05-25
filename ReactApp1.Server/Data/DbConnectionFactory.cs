using Npgsql;

namespace ReactApp1.Server.Data;

public sealed class DbConnectionFactory
{
    private readonly string _connectionString;

    public DbConnectionFactory(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Missing ConnectionStrings:DefaultConnection in configuration.");
    }

    public NpgsqlConnection CreateConnection() => new(_connectionString);
}
