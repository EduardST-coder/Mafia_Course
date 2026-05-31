using API.Habs;

using Application.Interfaces;

using Microsoft.AspNetCore.SignalR;

namespace API.SignalR;

public class GameNotifier : IGameNotifier
{
    private readonly IHubContext<GameHub> _hub;

    public GameNotifier(
        IHubContext<GameHub> hub)
    {
        _hub = hub;
    }

    public async Task GameUpdated(
        Guid roomId)
    {
        await _hub.Clients
            .Group(roomId.ToString())
            .SendAsync(
                "GameUpdated",
                roomId);
    }
}