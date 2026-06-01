using Microsoft.AspNetCore.SignalR;

namespace API.Habs;

public class WebRTCHub : Hub
{
    public async Task JoinCall(string roomId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"webrtc_{roomId}");
        await Clients.OthersInGroup($"webrtc_{roomId}").SendAsync("UserJoined", Context.ConnectionId);
    }

    public async Task LeaveCall(string roomId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"webrtc_{roomId}");
        await Clients.OthersInGroup($"webrtc_{roomId}").SendAsync("UserLeft", Context.ConnectionId);
    }

    public async Task SendOffer(string roomId, string targetConnectionId, string sdp)
    {
        await Clients.Client(targetConnectionId).SendAsync("ReceiveOffer", Context.ConnectionId, sdp);
    }

    public async Task SendAnswer(string roomId, string targetConnectionId, string sdp)
    {
        await Clients.Client(targetConnectionId).SendAsync("ReceiveAnswer", Context.ConnectionId, sdp);
    }

    public async Task SendIceCandidate(string roomId, string targetConnectionId, string candidate)
    {
        await Clients.Client(targetConnectionId).SendAsync("ReceiveIceCandidate", Context.ConnectionId, candidate);
    }
}