using Application.DTOs.Rooms;
using Application.Interfaces;

using Domain.Enums;

using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Rooms;

public class SheriffCheckHandler
{
    private readonly IAppDbContext _context;

    public SheriffCheckHandler(
        IAppDbContext context)
    {
        _context = context;
    }

    public async Task<IResult> Handle(
        SheriffCheckRequest request)
    {
        var sheriff = await _context.RoomPlayers
            .FirstOrDefaultAsync(x =>
                x.RoomId == request.RoomId &&
                x.UserId == request.SheriffId);

        if (sheriff is null)
        {
            return Results.BadRequest(
                "Sheriff not found");
        }

        if (!sheriff.IsAlive)
        {
            return Results.BadRequest(
                "Sheriff is dead");
        }

        if (sheriff.Role != GameRole.Sheriff)
        {
            return Results.BadRequest(
                "Only sheriff can check");
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
                "Check allowed only at night");
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

        var isMafia =
            target.Role == GameRole.Mafia ||
            target.Role == GameRole.Don;

        return Results.Ok(
            new SheriffCheckResponse
            {
                IsMafia = isMafia
            });
    }
}