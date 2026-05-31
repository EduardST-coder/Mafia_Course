using Application.DTOs.Rooms;
using Application.Interfaces;

using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Rooms;

public class GetRoomPlayersHandler
{
    private readonly IAppDbContext _context;

    public GetRoomPlayersHandler(
        IAppDbContext context)
    {
        _context = context;
    }

    public async Task<IResult> Handle(
        Guid roomId)
    {
        var players = await _context.RoomPlayers
            .Include(x => x.User)
            .Where(x => x.RoomId == roomId)
            .Select(x => new RoomPlayerResponse
            {
                UserId = x.UserId,

                Nickname = x.User.Nickname,

                IsOwner = x.IsOwner,

                SeatNumber = x.SeatNumber
            })
            .ToListAsync();

        return Results.Ok(players);
    }
}