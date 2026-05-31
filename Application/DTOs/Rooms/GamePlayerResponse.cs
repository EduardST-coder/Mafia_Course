namespace Application.DTOs.Rooms;

public class GamePlayerResponse
{
    public Guid UserId { get; set; }

    public string Nickname { get; set; } = default!;

    public bool IsAlive { get; set; }

    public bool IsOwner { get; set; }
}