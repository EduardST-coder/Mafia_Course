namespace Application.DTOs.Rooms;

public class StartGameRequest
{
    public Guid RoomId { get; set; }

    public Guid UserId { get; set; }
}