using Application.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Public;

public record HomeStatsDto(
    int OnlineNow,
    int InGame,
    int InLobby,
    int LookingForGame,
    int TotalRooms,
    int ActiveGames
);

public class GetHomeStatsHandler
{
    private readonly IAppDbContext _context;

    public GetHomeStatsHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<HomeStatsDto> Handle()
    {
        var onlineNow = await _context.Users.CountAsync(u => u.IsOnline);
        var totalRooms = await _context.Rooms.CountAsync();
        var activeGames = await _context.Rooms.CountAsync(r => r.Status == Domain.Enums.RoomStatus.InProgress);
        var inLobby = await _context.Rooms.CountAsync(r => r.Status == Domain.Enums.RoomStatus.Waiting);

        var usersInRooms = await _context.RoomPlayers
            .Select(rp => rp.UserId)
            .Distinct()
            .CountAsync();

        var lookingForGame = Math.Max(0, onlineNow - usersInRooms);

        var inGame = await _context.RoomPlayers
            .Where(rp => rp.Room.Status == Domain.Enums.RoomStatus.InProgress)
            .Select(rp => rp.UserId)
            .Distinct()
            .CountAsync();

        return new HomeStatsDto(
            onlineNow,
            inGame,
            inLobby,
            lookingForGame,
            totalRooms,
            activeGames
        );
    }
}