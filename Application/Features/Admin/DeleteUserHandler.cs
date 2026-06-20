using Application.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Admin;

public class DeleteUserHandler
{
    private readonly IAppDbContext _context;

    public DeleteUserHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(string userId)
    {
        if (!Guid.TryParse(userId, out var guid))
            return false;

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == guid);

        if (user == null)
            return false;

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return true;
    }
}