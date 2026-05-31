namespace Application.DTOs.Rooms;

public class MafiaKillRequest
{
    public Guid RoomId { get; set; }

    public Guid KillerId { get; set; }

    public Guid TargetId { get; set; }
}