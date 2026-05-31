namespace Application.DTOs.Rooms;

public class LeaveRoomRequest
{
    public Guid RoomId { get; set; }

    public Guid UserId { get; set; }
}