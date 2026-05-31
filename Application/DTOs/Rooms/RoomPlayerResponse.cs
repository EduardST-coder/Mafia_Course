namespace Application.DTOs.Rooms;

public class RoomPlayerResponse
{
    public Guid UserId { get; set; }

    public string Nickname { get; set; } = default!;

    public bool IsOwner { get; set; }

    public int? SeatNumber { get; set; }
}