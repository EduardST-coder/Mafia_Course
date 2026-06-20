using Application.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Admin;

public record AdminStatsDto(
    int TotalUsers,
    int OnlineUsers,
    int TotalRooms,
    int ActiveRooms,
    int GamesPlayedToday
);

public class GetAdminStatsHandler
{
    private readonly IAppDbContext _context;

    public GetAdminStatsHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<AdminStatsDto> Handle()
    {
        var totalUsers = await _context.Users.CountAsync();
        var onlineUsers = await _context.Users.CountAsync(u => u.IsOnline);
        var totalRooms = await _context.Rooms.CountAsync();
        var activeRooms = await _context.Rooms.CountAsync(r => r.IsActive);

        var today = DateTime.UtcNow.Date;
        var gamesToday = 0; 

        return new AdminStatsDto(
            totalUsers,
            onlineUsers,
            totalRooms,
            activeRooms,
            gamesToday
        );
    }
}