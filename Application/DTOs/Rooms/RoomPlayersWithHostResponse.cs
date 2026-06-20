namespace Application.DTOs.Rooms;

public class RoomPlayersWithHostResponse
{
    public Guid? HostId { get; set; }
    public string? HostName { get; set; }
    public List<RoomPlayerResponse> Players { get; set; } = new ();
}