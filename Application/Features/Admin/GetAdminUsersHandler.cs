using Application.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Admin;

public record AdminUserDto(
    string Id,
    string Nickname,
    string Email,
    int Rating,
    string Role,
    int GamesPlayed,
    DateTime? LastSeenAt
);

public class GetAdminUsersHandler
{
    private readonly IAppDbContext _context;

    public GetAdminUsersHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<AdminUserDto>> Handle()
    {
        return await _context.Users
            .OrderByDescending(u => u.LastSeenAt)
            .Select(u => new AdminUserDto(
                u.Id.ToString(),
                u.Nickname,
                u.Email,
                u.Rating,
                u.Role.ToString(),
                u.Rooms != null ? u.Rooms.Count : 0,
                u.LastSeenAt
            ))
            .ToListAsync();
    }
}