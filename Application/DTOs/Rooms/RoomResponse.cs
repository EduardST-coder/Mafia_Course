namespace Application.DTOs.Rooms;

public class RoomResponse
{
    public Guid Id { get; set; }

    public string Name { get; set; } = default!;

    public int PlayersCount { get; set; }

    public int MaxPlayers { get; set; }

    public bool IsPrivate { get; set; }

    public Guid? HostId { get; set; }

    public string? HostName { get; set; }
}