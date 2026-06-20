using Application.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Admin;

public record AdminRoomDto(
    string Id,
    string Name,
    string OwnerNickname,
    int PlayersCount,
    int MaxPlayers,
    string Status,
    bool IsActive,
    DateTime CreatedAt
);

public class GetAdminRoomsHandler
{
    private readonly IAppDbContext _context;

    public GetAdminRoomsHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<AdminRoomDto>> Handle()
    {
        return await _context.Rooms
            .Include(r => r.Players)
            .ThenInclude(rp => rp.User)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new AdminRoomDto(
                r.Id.ToString(),
                r.Name,
                r.Players.FirstOrDefault(p => p.UserId == r.OwnerId)!.User.Nickname,
                r.Players.Count,
                r.MaxPlayers,
                r.Status.ToString(),
                r.IsActive,
                r.CreatedAt
            ))
            .ToListAsync();
    }
}