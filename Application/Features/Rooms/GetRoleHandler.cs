using Application.DTOs.Rooms;
using Application.Interfaces;

using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Rooms;

public class GetRoleHandler
{
    private readonly IAppDbContext _context;

    public GetRoleHandler(
        IAppDbContext context)
    {
        _context = context;
    }

    public async Task<IResult> Handle(
        GetRoleRequest request)
    {
        var roomPlayer = await _context.RoomPlayers
            .FirstOrDefaultAsync(x =>
                x.RoomId == request.RoomId &&
                x.UserId == request.UserId);

        if (roomPlayer is null)
        {
            return Results.BadRequest(
                "Player not found");
        }

        if (roomPlayer.Role is null)
        {
            return Results.BadRequest(
                "Game not started");
        }

        return Results.Ok(
            new RoleResponse
            {
                Role = roomPlayer.Role.ToString()
            });
    }
}