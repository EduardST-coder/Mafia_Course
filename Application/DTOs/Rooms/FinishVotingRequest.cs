namespace Application.DTOs.Rooms;

public class FinishVotingRequest
{
    public Guid RoomId { get; set; }

    public Guid UserId { get; set; }
}