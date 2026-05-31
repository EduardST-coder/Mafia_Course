using Application.Interfaces;

using Microsoft.AspNetCore.SignalR;

namespace API.Habs;

public class GameHub : Hub
{
    private readonly IConnectionManager
        _connectionManager;

    public GameHub(
        IConnectionManager connectionManager)
    {
        _connectionManager =
            connectionManager;
    }

    public async Task RegisterUser(
        Guid userId)
    {
        _connectionManager.AddConnection(
            userId,
            Context.ConnectionId);

        await Task.CompletedTask;
    }

    public override async Task OnDisconnectedAsync(
        Exception? exception)
    {
        _connectionManager.RemoveConnection(
            Context.ConnectionId);

        await base.OnDisconnectedAsync(
            exception);
    }

    public async Task JoinRoom(
        string roomId)
    {
        await Groups.AddToGroupAsync(
            Context.ConnectionId,
            roomId);
    }

    public async Task LeaveRoom(
        string roomId)
    {
        await Groups.RemoveFromGroupAsync(
            Context.ConnectionId,
            roomId);
    }

    public async Task SendOffer(
        Guid targetUserId,
        string offer)
    {
        var connectionId =
            _connectionManager
                .GetConnectionId(
                    targetUserId);

        if (connectionId is null)
        {
            return;
        }

        await Clients.Client(
                connectionId)
            .SendAsync(
                "ReceiveOffer",
                Context.ConnectionId,
                offer);
    }

    public async Task SendAnswer(
        Guid targetUserId,
        string answer)
    {
        var connectionId =
            _connectionManager
                .GetConnectionId(
                    targetUserId);

        if (connectionId is null)
        {
            return;
        }

        await Clients.Client(
                connectionId)
            .SendAsync(
                "ReceiveAnswer",
                Context.ConnectionId,
                answer);
    }

    public async Task SendIceCandidate(
        Guid targetUserId,
        string candidate)
    {
        var connectionId =
            _connectionManager
                .GetConnectionId(
                    targetUserId);

        if (connectionId is null)
        {
            return;
        }

        await Clients.Client(
                connectionId)
            .SendAsync(
                "ReceiveIceCandidate",
                Context.ConnectionId,
                candidate);
    }
}