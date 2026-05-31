namespace Application.DTOs.Rooms;

public class DonCheckRequest
{
    public Guid RoomId { get; set; }

    public Guid DonId { get; set; }

    public Guid TargetId { get; set; }
}