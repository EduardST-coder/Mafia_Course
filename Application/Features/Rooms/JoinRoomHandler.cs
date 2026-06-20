using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Rooms;

public record JoinRoomResult(bool Success, string? Message = null);

public class JoinRoomHandler
{
    private readonly IAppDbContext _context;

    public JoinRoomHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<JoinRoomResult> Handle(
        Guid userId,
        Guid roomId,
        string? password,
        CancellationToken ct = default)
    {
        var room = await _context.Rooms
            .Include(x => x.Players)
            .FirstOrDefaultAsync(x => x.Id == roomId, ct);

        if (room is null)
            return new JoinRoomResult(false, "Room not found");

        if (room.Status != RoomStatus.Waiting)
            return new JoinRoomResult(false, "Game already started");

        if (room.Players.Count >= room.MaxPlayers)
            return new JoinRoomResult(false, "Room is full");

        if (room.IsPrivate && room.Password != password)
            return new JoinRoomResult(false, "Invalid password");

        var alreadyJoined = room.Players.Any(x => x.UserId == userId);
        if (alreadyJoined)
        {
            return new JoinRoomResult(true, "Already joined");
        }

        var roomPlayer = new RoomPlayer(room.Id, userId, false);
        _context.RoomPlayers.Add(roomPlayer);
        await _context.SaveChangesAsync(ct);

        return new JoinRoomResult(true, "Successfully joined");
    }
}