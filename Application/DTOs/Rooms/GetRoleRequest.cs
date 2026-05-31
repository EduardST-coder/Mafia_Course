namespace Application.DTOs.Rooms;

public class GetRoleRequest
{
    public Guid RoomId { get; set; }

    public Guid UserId { get; set; }
}