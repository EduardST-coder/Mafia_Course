using Application.DTOs.Rooms;
using Application.Interfaces;

using Microsoft.EntityFrameworkCore;

namespace Application.Features.Rooms;

public class GetRoomsHandler
{
    private readonly IAppDbContext _context;

    public GetRoomsHandler(
        IAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<RoomListItemDto>> Handle()
    {
        return await _context.Rooms
            .Select(x => new RoomListItemDto
            {
                Id = x.Id,

                Name = x.Name,

                PlayersCount = x.Players.Count,

                MaxPlayers = x.MaxPlayers,

                IsPrivate = x.IsPrivate
            })
            .ToListAsync();
    }
}