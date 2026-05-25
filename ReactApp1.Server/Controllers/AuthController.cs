using Microsoft.AspNetCore.Mvc;
using ReactApp1.Server.DTOs;
using ReactApp1.Server.Services;

namespace ReactApp1.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Username) ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest("All fields are required.");
        }

        try
        {
            var (user, token) = await _authService.RegisterAsync(
                request.Username.Trim(),
                request.Email.Trim(),
                request.Password);

            return Ok(new AuthResponse(token, ToDto(user)));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest("Email and password are required.");
        }

        try
        {
            var (user, token) = await _authService.LoginAsync(
                request.Email.Trim(),
                request.Password);

            return Ok(new AuthResponse(token, ToDto(user)));
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }
    }

    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> Me()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var user = await _authService.GetUserByIdAsync(userId);

        if (user is null)
        {
            return NotFound();
        }

        return Ok(ToDto(user));
    }

    private static UserDto ToDto(Models.User user)
    {
        var displayName = user.DisplayName ?? user.Username;
        var initials = string.Join("", displayName
            .Split(' ', StringSplitOptions.RemoveEmptyEntries)
            .Take(2)
            .Select(w => char.ToUpper(w[0])));

        return new UserDto(
            user.Id.ToString(),
            displayName,
            user.Email ?? string.Empty,
            string.IsNullOrEmpty(initials) ? "?" : initials);
    }
}
