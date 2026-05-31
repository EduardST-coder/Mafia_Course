using Application.DTOs.Rooms;
using Application.Interfaces;

using Domain.Enums;

using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Rooms;

public class CheckGameResultHandler
{
    private readonly IAppDbContext _context;

    public CheckGameResultHandler(
        IAppDbContext context)
    {
        _context = context;
    }

    public async Task<IResult> Handle(
        Guid roomId)
    {
        var room = await _context.Rooms
            .Include(x => x.Players)
            .FirstOrDefaultAsync(x =>
                x.Id == roomId);

        if (room is null)
        {
            return Results.BadRequest(
                "Room not found");
        }

        var alivePlayers = room.Players
            .Where(x => x.IsAlive)
            .ToList();

        var blackCount = alivePlayers.Count(x =>
            x.Role == GameRole.Mafia ||
            x.Role == GameRole.Don);

        var redCount = alivePlayers.Count(x =>
            x.Role == GameRole.Civilian ||
            x.Role == GameRole.Sheriff);

        // RED WIN
        if (blackCount == 0)
        {
            room.FinishGame();

            await _context.SaveChangesAsync();

            return Results.Ok(
                new GameResultResponse
                {
                    IsFinished = true,

                    Winner = "Red"
                });
        }

        // BLACK WIN
        if (blackCount >= redCount)
        {
            room.FinishGame();

            await _context.SaveChangesAsync();

            return Results.Ok(
                new GameResultResponse
                {
                    IsFinished = true,

                    Winner = "Black"
                });
        }

        return Results.Ok(
            new GameResultResponse
            {
                IsFinished = false
            });
    }
}