namespace Application.DTOs.Rooms;

public class GameStateResponse
{
    public string Status { get; set; } = default!;

    public string Phase { get; set; } = default!;

    public int Round { get; set; }

    public bool IsRevote { get; set; }

    public List<Guid> RevotePlayerIds
    { get; set; } = [];

    public List<GamePlayerResponse> Players
    { get; set; } = [];
}