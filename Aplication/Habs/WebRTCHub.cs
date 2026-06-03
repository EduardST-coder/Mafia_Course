using Microsoft.AspNetCore.SignalR;

namespace API.Habs;

public class WebRTCHub : Hub
{
    // Мапінг: connectionId → userId
    private static readonly Dictionary<string, string> _userMap = new();
    // Мапінг: roomId → список connectionId
    private static readonly Dictionary<string, HashSet<string>> _roomConnections = new();

    public async Task JoinCall(string roomId, string userId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"webrtc_{roomId}");

        _userMap[Context.ConnectionId] = userId;

        if (!_roomConnections.ContainsKey(roomId))
            _roomConnections[roomId] = new HashSet<string>();
        _roomConnections[roomId].Add(Context.ConnectionId);

        // Повідомити інших з userId
        await Clients.OthersInGroup($"webrtc_{roomId}")
            .SendAsync("UserJoined", Context.ConnectionId, userId);
    }

    public async Task SendOffer(string roomId, string targetConnectionId, string sdp)
    {
        var fromUserId = _userMap.GetValueOrDefault(Context.ConnectionId, "");
        await Clients.Client(targetConnectionId)
            .SendAsync("ReceiveOffer", Context.ConnectionId, fromUserId, sdp);
    }

    public async Task SendAnswer(string roomId, string targetConnectionId, string sdp)
    {
        await Clients.Client(targetConnectionId)
            .SendAsync("ReceiveAnswer", Context.ConnectionId, sdp);
    }

    public async Task SendIceCandidate(string roomId, string targetConnectionId, string candidate)
    {
        await Clients.Client(targetConnectionId)
            .SendAsync("ReceiveIceCandidate", Context.ConnectionId, candidate);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var connectionId = Context.ConnectionId;
        var userId = _userMap.GetValueOrDefault(connectionId, "");

        // Знайти roomId за connectionId
        var roomId = _roomConnections.FirstOrDefault(r => r.Value.Contains(connectionId)).Key;

        if (roomId != null)
        {
            _roomConnections[roomId].Remove(connectionId);
            await Clients.Group($"webrtc_{roomId}")
                .SendAsync("UserLeft", connectionId, userId);
        }

        _userMap.Remove(connectionId);
        await base.OnDisconnectedAsync(exception);
    }
}