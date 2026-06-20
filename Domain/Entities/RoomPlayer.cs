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

    public bool IsReady { get; private set; } = false;  

    public int? SeatNumber { get; private set; }

    public GameRole? Role { get; private set; }

    public int Fouls { get; private set; } = 0;        

    public string Status => IsAlive ? "Alive" : "Dead";  

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

    public void TakeSeat(int seatNumber)
    {
        SeatNumber = seatNumber;
        MarkUpdated();
    }

    public void SetRole(GameRole role)
    {
        Role = role;
        MarkUpdated();
    }

    public void Kill()
    {
        IsAlive = false;
        MarkUpdated();
    }

    public void SetReady(bool ready)
    {
        IsReady = ready;
        MarkUpdated();
    }

    public void GiveFoul()
    {
        Fouls++;
        MarkUpdated();
    }

    public void Eliminate()
    {
        IsAlive = false;
        Fouls = 4;  
        MarkUpdated();
    }

    public void ResetFouls()
    {
        Fouls = 0;
        MarkUpdated();
    }
}