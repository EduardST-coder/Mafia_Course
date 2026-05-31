using Application.DTOs.Users;
using Application.Interfaces;

using Microsoft.EntityFrameworkCore;

namespace Application.Features.Users;

public class GetUsersHandler
{
    private readonly IAppDbContext _context;

    public GetUsersHandler(
        IAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<UserDto>> Handle()
    {
        return await _context.Users
            .Select(x => new UserDto
            {
                Id = x.Id,

                Nickname = x.Nickname,

                Email = x.Email
            })
            .ToListAsync();
    }
}