namespace Application.Interfaces;

public interface IConnectionManager
{
    void AddConnection(
        Guid userId,
        string connectionId);

    void RemoveConnection(
        string connectionId);

    string? GetConnectionId(
        Guid userId);
}