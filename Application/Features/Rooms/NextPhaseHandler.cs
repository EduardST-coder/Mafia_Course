using Application.DTOs.Rooms;
using Application.Interfaces;

using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Rooms;

public class NextPhaseHandler
{
    private readonly IAppDbContext _context;

    private readonly IGameNotifier _notifier;

    public NextPhaseHandler(
        IAppDbContext context,
        IGameNotifier notifier)
    {
        _context = context;

        _notifier = notifier;
    }

    public async Task<IResult> Handle(
        NextPhaseRequest request)
    {
        var room = await _context.Rooms
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
                "Only owner can switch phase");
        }

        room.NextPhase();

        await _context.SaveChangesAsync();

        await _notifier.GameUpdated(
            room.Id);

        return Results.Ok(new
        {
            room.Phase,
            room.Round
        });
    }
}