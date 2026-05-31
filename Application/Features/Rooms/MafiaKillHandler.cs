using Application.DTOs.Rooms;
using Application.Interfaces;

using Domain.Enums;

using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Rooms;

public class MafiaKillHandler
{
    private readonly IAppDbContext _context;

    private readonly IGameNotifier _notifier;

    public MafiaKillHandler(
        IAppDbContext context,
        IGameNotifier notifier)
    {
        _context = context;

        _notifier = notifier;
    }

    public async Task<IResult> Handle(
        MafiaKillRequest request)
    {
        var killer = await _context.RoomPlayers
            .FirstOrDefaultAsync(x =>
                x.RoomId == request.RoomId &&
                x.UserId == request.KillerId);

        if (killer is null)
        {
            return Results.BadRequest(
                "Killer not found");
        }

        if (!killer.IsAlive)
        {
            return Results.BadRequest(
                "Killer is dead");
        }

        if (killer.Role != GameRole.Mafia &&
            killer.Role != GameRole.Don)
        {
            return Results.BadRequest(
                "Only mafia can kill");
        }

        var room = await _context.Rooms
            .FirstOrDefaultAsync(x =>
                x.Id == request.RoomId);

        if (room is null)
        {
            return Results.BadRequest(
                "Room not found");
        }

        if (room.Phase != GamePhase.Night)
        {
            return Results.BadRequest(
                "Kill allowed only at night");
        }

        var target = await _context.RoomPlayers
            .FirstOrDefaultAsync(x =>
                x.RoomId == request.RoomId &&
                x.UserId == request.TargetId);

        if (target is null)
        {
            return Results.BadRequest(
                "Target not found");
        }

        if (!target.IsAlive)
        {
            return Results.BadRequest(
                "Target already dead");
        }

        target.Kill();

        await _context.SaveChangesAsync();

        await _notifier.GameUpdated(
            room.Id);

        return Results.Ok();
    }
}