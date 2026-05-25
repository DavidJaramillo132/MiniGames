namespace ReactApp1.Server.DTOs;

public sealed record LoginRequest(string Email, string Password);

public sealed record RegisterRequest(string Username, string Email, string Password);

public sealed record AuthResponse(string Token, UserDto User);

public sealed record UserDto(string Id, string Name, string Email, string Initials);

public sealed record CreateRoomRequest(string GameSlug, string Name, string? RoomCode);

public sealed record RoomDto(
    string Id,
    string GameSlug,
    string Name,
    string RoomCode,
    string Status,
    int Capacity,
    int CurrentPlayers,
    string Creator,
    string CreatedAt
);

public sealed record GameDto(
    string Id,
    string Name,
    string Description,
    string AccentColor,
    int PlayersOnline,
    bool IsAvailable,
    string? StatusLabel
);

public sealed record LeaderboardEntryDto(
    int Rank,
    string Username,
    int Elo,
    int Wins,
    string? RankColor
);

public sealed record PlayerStatsDto(
    string GameName,
    StatTileDto[] Tiles
);

public sealed record StatTileDto(string Label, string Value, string Note);
