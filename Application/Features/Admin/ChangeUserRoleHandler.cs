using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Admin;

public class ChangeUserRoleHandler
{
    private readonly IAppDbContext _context;

    public ChangeUserRoleHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<User?> Handle(string userId, string newRole)
    {
        if (!Guid.TryParse(userId, out var guid))
            return null;

        if (!Enum.TryParse<UserRole>(newRole, out var role))
            return null;

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == guid);

        if (user == null)
            return null;

        user.ChangeRole(role);
        await _context.SaveChangesAsync();

        return user;
    }
}