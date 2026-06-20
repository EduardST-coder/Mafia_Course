namespace Application.DTOs.Rooms;

public class RoomPlayerResponse
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public Guid RoomId { get; set; }

    public string Nickname { get; set; } = default!;

    public bool IsOwner { get; set; }

    public bool IsReady { get; set; }

    public int? SeatNumber { get; set; }

    public string? Status { get; set; }

    public string? GameRole { get; set; }

    public int Fouls { get; set; }

    public UserInfoResponse? User { get; set; }
}

public class UserInfoResponse
{
    public Guid Id { get; set; }

    public string Nickname { get; set; } = default!;

    public string? AvatarUrl { get; set; }
}