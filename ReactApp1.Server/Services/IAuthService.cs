namespace ReactApp1.Server.Services;

public interface IAuthService
{
    Task<(Models.User User, string Token)> RegisterAsync(string username, string email, string password);
    Task<(Models.User User, string Token)> LoginAsync(string email, string password);
    Task<Models.User?> GetUserByIdAsync(Guid userId);
}
