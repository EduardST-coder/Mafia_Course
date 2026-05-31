namespace Application.DTOs.Rooms;

public class JoinRoomRequest
{
    public Guid RoomId { get; set; }

    public string? Password { get; set; }
}