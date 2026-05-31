namespace Application.DTOs.Rooms;

public class FinishRevoteRequest
{
    public Guid RoomId { get; set; }

    public Guid UserId { get; set; }
}