using Application.DTOs.Rooms;
using Application.Interfaces;

using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Rooms;

public class LeaveRoomHandler
{
    private readonly IAppDbContext _context;

    public LeaveRoomHandler(
        IAppDbContext context)
    {
        _context = context;
    }

    public async Task<IResult> Handle(
        LeaveRoomRequest request)
    {
        var roomPlayer = await _context.RoomPlayers
            .FirstOrDefaultAsync(x =>
                x.RoomId == request.RoomId &&
                x.UserId == request.UserId);

        if (roomPlayer is null)
        {
            return Results.BadRequest(
                "Player not found in room");
        }

        _context.RoomPlayers.Remove(roomPlayer);

        await _context.SaveChangesAsync();

        return Results.Ok();
    }
}