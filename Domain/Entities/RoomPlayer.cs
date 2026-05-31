using Domain.Common;
using Domain.Enums;

namespace Domain.Entities;

public class RoomPlayer : BaseEntity
{
    public Guid RoomId { get; private set; }

    public Room Room { get; private set; } = default!;

    public Guid UserId { get; private set; }

    public User User { get; private set; } = default!;

    public bool IsOwner { get; private set; }

    public bool IsAlive { get; private set; } = true;

    public int? SeatNumber { get; private set; }

    public GameRole? Role { get; private set; }

    private RoomPlayer()
    {
    }

    public RoomPlayer(
        Guid roomId,
        Guid userId,
        bool isOwner)
    {
        RoomId = roomId;

        UserId = userId;

        IsOwner = isOwner;
    }

    public void TakeSeat(
        int seatNumber)
    {
        SeatNumber = seatNumber;

        MarkUpdated();
    }

    public void SetRole(
        GameRole role)
    {
        Role = role;

        MarkUpdated();
    }

    public void Kill()
    {
        IsAlive = false;

        MarkUpdated();
    }
}