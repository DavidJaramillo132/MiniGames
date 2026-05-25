using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Dapper;
using Microsoft.IdentityModel.Tokens;
using ReactApp1.Server.Data;
using ReactApp1.Server.Models;

namespace ReactApp1.Server.Services;

public sealed class AuthService : IAuthService
{
    private readonly DbConnectionFactory _db;
    private readonly IConfiguration _config;

    static AuthService()
    {
        DefaultTypeMap.MatchNamesWithUnderscores = true;
    }

    public AuthService(DbConnectionFactory db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    public async Task<(User User, string Token)> RegisterAsync(string username, string email, string password)
    {
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(password);
        var user = new User
        {
            Id = Guid.NewGuid(),
            Username = username,
            PasswordHash = passwordHash,
            Email = email,
            DisplayName = username,
            CreatedAt = DateTime.UtcNow
        };

        const string sql = """
            INSERT INTO users (id, username, password_hash, email, display_name, created_at)
            VALUES (@Id, @Username, @PasswordHash, @Email, @DisplayName, @CreatedAt)
            """;

        using var conn = _db.CreateConnection();
        await conn.ExecuteAsync(sql, user);

        var token = GenerateJwtToken(user);
        return (user, token);
    }

    public async Task<(User User, string Token)> LoginAsync(string email, string password)
    {
        const string sql = "SELECT * FROM users WHERE LOWER(email) = LOWER(@Email)";

        using var conn = _db.CreateConnection();
        var user = await conn.QuerySingleOrDefaultAsync<User>(sql, new { Email = email });

        if (user is null)
            throw new UnauthorizedAccessException("Invalid email or password.");

        if (!BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid email or password.");

        var token = GenerateJwtToken(user);
        return (user, token);
    }

    public async Task<User?> GetUserByIdAsync(Guid userId)
    {
        const string sql = "SELECT * FROM users WHERE id = @Id";

        using var conn = _db.CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<User>(sql, new { Id = userId });
    }

    private string GenerateJwtToken(User user)
    {
        var key = _config["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key is not configured.");
        var issuer = _config["Jwt:Issuer"];
        var audience = _config["Jwt:Audience"];
        var expiresMinutes = int.TryParse(_config["Jwt:ExpiresInMinutes"], out var m) ? m : 60;

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim("username", user.Username),
            new Claim(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expiresMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
