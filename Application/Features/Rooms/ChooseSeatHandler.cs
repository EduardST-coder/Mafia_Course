using Application.DTOs.Rooms;
using Application.Interfaces;

using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Rooms;

public class ChooseSeatHandler
{
    private readonly IAppDbContext _context;

    public ChooseSeatHandler(
        IAppDbContext context)
    {
        _context = context;
    }

    public async Task<IResult> Handle(
        Guid userId,
        ChooseSeatRequest request)
    {
        if (request.SeatNumber < 1 ||
            request.SeatNumber > 10)
        {
            return Results.BadRequest(
                "Invalid seat number");
        }

        var roomPlayer = await _context.RoomPlayers
            .FirstOrDefaultAsync(x =>
                x.RoomId == request.RoomId &&
                x.UserId == userId);

        if (roomPlayer is null)
        {
            return Results.BadRequest(
                "Player not found in room");
        }

        if (roomPlayer.IsOwner)
        {
            return Results.BadRequest(
                "Host cannot take a seat");
        }

        var seatTaken = await _context.RoomPlayers
            .AnyAsync(x =>
                x.RoomId == request.RoomId &&
                x.SeatNumber == request.SeatNumber &&
                x.UserId != userId);

        if (seatTaken)
        {
            return Results.BadRequest(
                "Seat already taken");
        }

        roomPlayer.TakeSeat(
            request.SeatNumber);

        await _context.SaveChangesAsync();

        return Results.Ok();
    }
}