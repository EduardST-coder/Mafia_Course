namespace Application.DTOs.Rooms;

public class GameResultResponse
{
    public bool IsFinished { get; set; }

    public string? Winner { get; set; }
}