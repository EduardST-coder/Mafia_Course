using Application.DTOs.Rooms;
using Application.Interfaces;

using Domain.Enums;

using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Rooms;

public class DonCheckHandler
{
    private readonly IAppDbContext _context;

    public DonCheckHandler(
        IAppDbContext context)
    {
        _context = context;
    }

    public async Task<IResult> Handle(
        DonCheckRequest request)
    {
        var don = await _context.RoomPlayers
            .FirstOrDefaultAsync(x =>
                x.RoomId == request.RoomId &&
                x.UserId == request.DonId);

        if (don is null)
        {
            return Results.BadRequest(
                "Don not found");
        }

        if (!don.IsAlive)
        {
            return Results.BadRequest(
                "Don is dead");
        }

        if (don.Role != GameRole.Don)
        {
            return Results.BadRequest(
                "Only don can check");
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

        return Results.Ok(
            new DonCheckResponse
            {
                IsSheriff =
                    target.Role == GameRole.Sheriff
            });
    }
}