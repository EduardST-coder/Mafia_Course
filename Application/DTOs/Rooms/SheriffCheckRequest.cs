namespace Application.DTOs.Rooms;

public class SheriffCheckRequest
{
    public Guid RoomId { get; set; }

    public Guid SheriffId { get; set; }

    public Guid TargetId { get; set; }
}