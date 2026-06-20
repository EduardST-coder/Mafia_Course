using Microsoft.AspNetCore.SignalR;

namespace API.Habs;

public class WebRTCHub : Hub
{
    private static readonly Dictionary<string, string> _userMap = new();

    private static readonly Dictionary<string, HashSet<string>>
        _roomConnections = new();

    public async Task JoinCall(
        string roomId,
        string userId)
    {
        await Groups.AddToGroupAsync(
            Context.ConnectionId,
            $"webrtc_{roomId}");

        _userMap[Context.ConnectionId] = userId;

        if (!_roomConnections.ContainsKey(roomId))
        {
            _roomConnections[roomId] =
                new HashSet<string>();
        }

        var existingUsers =
            _roomConnections[roomId]
                .Where(x => x != Context.ConnectionId)
                .Select(x => new
                {
                    ConnectionId = x,
                    UserId = _userMap.GetValueOrDefault(
                        x,
                        string.Empty)
                })
                .ToList();

        _roomConnections[roomId]
            .Add(Context.ConnectionId);

        await Clients.Caller.SendAsync(
            "ExistingUsers",
            existingUsers);

        await Clients.OthersInGroup(
                $"webrtc_{roomId}")
            .SendAsync(
                "UserJoined",
                Context.ConnectionId,
                userId);
    }

    public async Task SendOffer(
        string roomId,
        string targetConnectionId,
        string sdp)
    {
        var fromUserId =
            _userMap.GetValueOrDefault(
                Context.ConnectionId,
                string.Empty);

        await Clients.Client(
                targetConnectionId)
            .SendAsync(
                "ReceiveOffer",
                Context.ConnectionId,
                fromUserId,
                sdp);
    }

    public async Task SendAnswer(
        string roomId,
        string targetConnectionId,
        string sdp)
    {
        var fromUserId =
            _userMap.GetValueOrDefault(
                Context.ConnectionId,
                string.Empty);

        await Clients.Client(
                targetConnectionId)
            .SendAsync(
                "ReceiveAnswer",
                Context.ConnectionId,
                fromUserId,
                sdp);
    }

    public async Task SendIceCandidate(
        string roomId,
        string targetConnectionId,
        string candidate)
    {
        var fromUserId =
            _userMap.GetValueOrDefault(
                Context.ConnectionId,
                string.Empty);

        await Clients.Client(
                targetConnectionId)
            .SendAsync(
                "ReceiveIceCandidate",
                Context.ConnectionId,
                fromUserId,
                candidate);
    }

    public override async Task OnDisconnectedAsync(
        Exception? exception)
    {
        var connectionId =
            Context.ConnectionId;

        var userId =
            _userMap.GetValueOrDefault(
                connectionId,
                string.Empty);

        var roomId =
            _roomConnections
                .FirstOrDefault(
                    r => r.Value.Contains(connectionId))
                .Key;

        if (!string.IsNullOrEmpty(roomId))
        {
            _roomConnections[roomId]
                .Remove(connectionId);

            if (_roomConnections[roomId].Count == 0)
            {
                _roomConnections.Remove(roomId);
            }

            await Clients.Group(
                    $"webrtc_{roomId}")
                .SendAsync(
                    "UserLeft",
                    connectionId,
                    userId);
        }

        _userMap.Remove(connectionId);

        await base.OnDisconnectedAsync(
            exception);
    }
}