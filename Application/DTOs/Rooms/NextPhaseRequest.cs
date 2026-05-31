namespace Application.DTOs.Rooms;

public class NextPhaseRequest
{
    public Guid RoomId { get; set; }

    public Guid UserId { get; set; }
}