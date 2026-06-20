using Application.DTOs.Rooms;
using Application.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Rooms;

public class GetRoomPlayersHandler
{
    private readonly IAppDbContext _context;

    public GetRoomPlayersHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<IResult> Handle(Guid roomId)
    {
        var room = await _context.Rooms
            .AsNoTracking()
            .Include(r => r.Players)
                .ThenInclude(p => p.User)
            .FirstOrDefaultAsync(r => r.Id == roomId);

        if (room == null)
            return Results.NotFound(new { message = "Room not found" });

        var host = room.Players.FirstOrDefault(p => p.IsOwner);

        var response = new RoomPlayersWithHostResponse
        {
            HostId = host?.UserId,
            HostName = host?.User?.Nickname ?? "Unknown",
            Players = room.Players.Select(x => new RoomPlayerResponse
            {
                Id = x.Id,
                UserId = x.UserId,
                RoomId = x.RoomId,
                Nickname = x.User?.Nickname ?? "Unknown",
                IsOwner = x.IsOwner,
                IsReady = x.IsReady,
                SeatNumber = x.SeatNumber,
                Status = x.Status,
                GameRole = x.Role?.ToString(),
                Fouls = x.Fouls,
                User = x.User == null ? null : new UserInfoResponse
                {
                    Id = x.User.Id,
                    Nickname = x.User.Nickname,
                    AvatarUrl = x.User.AvatarUrl
                }
            }).ToList()
        };

        return Results.Ok(response);
    }
}