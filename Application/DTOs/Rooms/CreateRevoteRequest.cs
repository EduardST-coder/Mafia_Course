namespace Application.DTOs.Rooms;

public class CreateRevoteRequest
{
    public Guid RoomId { get; set; }

    public Guid VoterId { get; set; }

    public Guid TargetId { get; set; }
}