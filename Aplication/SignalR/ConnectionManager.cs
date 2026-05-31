using Application.Interfaces;

using System.Collections.Concurrent;

namespace API.SignalR;

public class ConnectionManager
    : IConnectionManager
{
    private readonly ConcurrentDictionary<
        Guid,
        string> _connections = new();

    public void AddConnection(
        Guid userId,
        string connectionId)
    {
        _connections[userId] =
            connectionId;
    }

    public void RemoveConnection(
        string connectionId)
    {
        var pair = _connections
            .FirstOrDefault(x =>
                x.Value == connectionId);

        if (pair.Key != Guid.Empty)
        {
            _connections.TryRemove(
                pair.Key,
                out _);
        }
    }

    public string? GetConnectionId(
        Guid userId)
    {
        _connections.TryGetValue(
            userId,
            out var connectionId);

        return connectionId;
    }
}