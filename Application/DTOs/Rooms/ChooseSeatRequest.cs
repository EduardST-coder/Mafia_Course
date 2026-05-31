namespace Application.DTOs.Rooms;

public class ChooseSeatRequest
{
    public Guid RoomId { get; set; }

    public int SeatNumber { get; set; }
}