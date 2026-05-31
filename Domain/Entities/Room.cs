using Domain.Common;
using Domain.Enums;

namespace Domain.Entities;

public class Room : BaseEntity
{
    public string Name { get; private set; } = default!;

    public Guid OwnerId { get; private set; }

    public int MaxPlayers { get; private set; }

    public bool IsPrivate { get; private set; }

    public string? Password { get; private set; }

    public RoomStatus Status { get; private set; }
        = RoomStatus.Waiting;

    public GamePhase Phase { get; private set; }
        = GamePhase.Night;

    public int Round { get; private set; } = 1;

    public bool IsRevote { get; private set; }

    public List<Guid>? RevotePlayerIds
    { get; private set; }
        = new();

    public ICollection<RoomPlayer> Players
    { get; private set; }
        = new List<RoomPlayer>();

    private Room()
    {
    }

    public Room(
        string name,
        Guid ownerId,
        int maxPlayers,
        bool isPrivate,
        string? password)
    {
        Name = name;

        OwnerId = ownerId;

        MaxPlayers = maxPlayers;

        IsPrivate = isPrivate;

        Password = password;
    }

    public void StartGame()
    {
        Status = RoomStatus.InProgress;

        Phase = GamePhase.Night;

        Round = 1;

        MarkUpdated();
    }

    public void NextPhase()
    {
        if (Phase == GamePhase.Night)
        {
            Phase = GamePhase.Day;
        }
        else
        {
            Phase = GamePhase.Night;

            Round++;
        }

        MarkUpdated();
    }

    public void StartRevote(
        List<Guid> playerIds)
    {
        IsRevote = true;

        RevotePlayerIds = playerIds;

        MarkUpdated();
    }

    public void FinishRevote()
    {
        IsRevote = false;

        RevotePlayerIds = [];

        MarkUpdated();
    }

    public void FinishGame()
    {
        Status = RoomStatus.Finished;

        MarkUpdated();
    }
}