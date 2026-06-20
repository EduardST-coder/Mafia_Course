using Application.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Admin;

public class DeleteRoomHandler
{
    private readonly IAppDbContext _context;

    public DeleteRoomHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(string roomId)
    {
        if (!Guid.TryParse(roomId, out var guid))
            return false;

        var room = await _context.Rooms
            .Include(r => r.Players)
            .FirstOrDefaultAsync(r => r.Id == guid);

        if (room == null)
            return false;

        _context.RoomPlayers.RemoveRange(room.Players);
        _context.Rooms.Remove(room);
        await _context.SaveChangesAsync();

        return true;
    }
}