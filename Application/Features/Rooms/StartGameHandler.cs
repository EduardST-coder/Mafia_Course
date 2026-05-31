using Application.DTOs.Rooms;
using Application.Interfaces;

using Domain.Enums;

using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Rooms;

public class StartGameHandler
{
    private readonly IAppDbContext _context;

    private readonly IGameNotifier _notifier;

    public StartGameHandler(
        IAppDbContext context,
        IGameNotifier notifier)
    {
        _context = context;

        _notifier = notifier;
    }

    public async Task<IResult> Handle(
        StartGameRequest request)
    {
        var room = await _context.Rooms
            .Include(x => x.Players)
            .FirstOrDefaultAsync(x =>
                x.Id == request.RoomId);

        if (room is null)
        {
            return Results.BadRequest(
                "Room not found");
        }

        if (room.OwnerId != request.UserId)
        {
            return Results.BadRequest(
                "Only owner can start game");
        }

        if (room.Status != RoomStatus.Waiting)
        {
            return Results.BadRequest(
                "Game already started");
        }

        if (room.Players.Count != 10)
        {
            return Results.BadRequest(
                "Game requires exactly 10 players");
        }

        var players = room.Players
            .OrderBy(x => Guid.NewGuid())
            .ToList();

        // Sheriff
        players[0].SetRole(GameRole.Sheriff);

        // Don
        players[1].SetRole(GameRole.Don);

        // Mafia
        players[2].SetRole(GameRole.Mafia);

        players[3].SetRole(GameRole.Mafia);

        // Civilians
        for (int i = 4; i < players.Count; i++)
        {
            players[i].SetRole(
                GameRole.Civilian);
        }

        room.StartGame();

        await _context.SaveChangesAsync();

        await _notifier.GameUpdated(
            room.Id);

        return Results.Ok();
    }
}