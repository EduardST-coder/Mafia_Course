using Application.DTOs.Rooms;
using Application.Interfaces;

using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Rooms;

public class GetGameStateHandler
{
    private readonly IAppDbContext _context;

    public GetGameStateHandler(
        IAppDbContext context)
    {
        _context = context;
    }

    public async Task<IResult> Handle(
        Guid roomId)
    {
        var room = await _context.Rooms
            .Include(x => x.Players)
            .ThenInclude(x => x.User)
            .FirstOrDefaultAsync(x =>
                x.Id == roomId);

        if (room is null)
        {
            return Results.BadRequest(
                "Room not found");
        }

        return Results.Ok(
            new GameStateResponse
            {
                Status = room.Status.ToString(),

                Phase = room.Phase.ToString(),

                Round = room.Round,

                IsRevote = room.IsRevote,

                RevotePlayerIds =
                    room.RevotePlayerIds,

                Players = room.Players
                    .Select(x =>
                        new GamePlayerResponse
                        {
                            UserId = x.UserId,

                            Nickname = x.User.Nickname,

                            IsAlive = x.IsAlive,

                            IsOwner = x.IsOwner
                        })
                    .ToList()
            });
    }
}