using Domain.Common;

namespace Domain.Entities;

public class Vote : BaseEntity
{
    public Guid RoomId { get; private set; }

    public Guid VoterId { get; private set; }

    public Guid TargetId { get; private set; }

    public int Round { get; private set; }

    private Vote()
    {
    }

    public Vote(
        Guid roomId,
        Guid voterId,
        Guid targetId,
        int round)
    {
        RoomId = roomId;

        VoterId = voterId;

        TargetId = targetId;

        Round = round;
    }
}