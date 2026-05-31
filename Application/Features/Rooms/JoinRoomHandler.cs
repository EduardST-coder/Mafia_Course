using Application.DTOs.Rooms;
using Application.Interfaces;

using Domain.Entities;
using Domain.Enums;

using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Rooms;

public class JoinRoomHandler
{
    private readonly IAppDbContext _context;

    public JoinRoomHandler(
        IAppDbContext context)
    {
        _context = context;
    }

    public async Task<IResult> Handle(
        Guid userId,
        JoinRoomRequest request)
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

        if (room.Status != RoomStatus.Waiting)
        {
            return Results.BadRequest(
                "Game already started");
        }

        if (room.Players.Count >= room.MaxPlayers)
        {
            return Results.BadRequest(
                "Room is full");
        }

        var alreadyJoined = room.Players
            .Any(x => x.UserId == userId);

        if (alreadyJoined)
        {
            return Results.BadRequest(
                "Already joined");
        }

        if (room.IsPrivate &&
            room.Password != request.Password)
        {
            return Results.BadRequest(
                "Invalid password");
        }

        var roomPlayer = new RoomPlayer(
            room.Id,
            userId,
            false);

        _context.RoomPlayers.Add(
            roomPlayer);

        await _context.SaveChangesAsync();

        return Results.Ok();
    }
}