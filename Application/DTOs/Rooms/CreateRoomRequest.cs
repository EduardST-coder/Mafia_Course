namespace Application.DTOs.Rooms;

public class CreateRoomRequest
{
    public string Name { get; set; } = default!;

    public int MaxPlayers { get; set; }

    public bool IsPrivate { get; set; }

    public string? Password { get; set; }
}