namespace Application.DTOs.Rooms;

public class CreateVoteRequest
{
    public Guid RoomId { get; set; }

    public Guid VoterId { get; set; }

    public Guid TargetId { get; set; }
}