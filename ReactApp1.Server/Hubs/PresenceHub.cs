using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using ReactApp1.Server.Services;

namespace ReactApp1.Server.Hubs;

[Authorize]
public sealed class PresenceHub : Hub
{
    private readonly PresenceTracker _tracker;

    public PresenceHub(PresenceTracker tracker)
    {
        _tracker = tracker;
    }

    public override async Task OnConnectedAsync()
    {
        var snapshot = _tracker.Add(Context.ConnectionId);
        await Clients.All.SendAsync("PresenceUpdated", snapshot);
        await base.OnConnectedAsync();
    }

    public async Task SetGame(string? gameId)
    {
        var snapshot = _tracker.SetGame(Context.ConnectionId, gameId);
        await Clients.All.SendAsync("PresenceUpdated", snapshot);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var snapshot = _tracker.Remove(Context.ConnectionId);
        await Clients.All.SendAsync("PresenceUpdated", snapshot);
        await base.OnDisconnectedAsync(exception);
    }
}
