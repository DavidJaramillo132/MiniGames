namespace ReactApp1.Server.Services;

public sealed class PresenceTracker
{
    private readonly object _lock = new();
    private readonly Dictionary<string, string?> _connections = new();

    public PresenceSnapshot Add(string connectionId)
    {
        lock (_lock)
        {
            _connections[connectionId] = null;
            return CreateSnapshot();
        }
    }

    public PresenceSnapshot SetGame(string connectionId, string? gameId)
    {
        lock (_lock)
        {
            if (_connections.ContainsKey(connectionId))
            {
                _connections[connectionId] = string.IsNullOrWhiteSpace(gameId) ? null : gameId.Trim();
            }

            return CreateSnapshot();
        }
    }

    public PresenceSnapshot Remove(string connectionId)
    {
        lock (_lock)
        {
            _connections.Remove(connectionId);
            return CreateSnapshot();
        }
    }

    public PresenceSnapshot GetSnapshot()
    {
        lock (_lock)
        {
            return CreateSnapshot();
        }
    }

    private PresenceSnapshot CreateSnapshot()
    {
        var games = _connections.Values
            .Where(gameId => !string.IsNullOrWhiteSpace(gameId))
            .GroupBy(gameId => gameId!, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(group => group.Key, group => group.Count(), StringComparer.OrdinalIgnoreCase);

        return new PresenceSnapshot(_connections.Count, games);
    }
}

public sealed record PresenceSnapshot(int TotalOnline, IReadOnlyDictionary<string, int> Games);
