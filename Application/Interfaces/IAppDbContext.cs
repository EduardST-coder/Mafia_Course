using Domain.Entities;

using Microsoft.EntityFrameworkCore;

namespace Application.Interfaces;

public interface IAppDbContext
{
    DbSet<User> Users { get; }

    DbSet<Room> Rooms { get; }

    DbSet<RoomPlayer> RoomPlayers { get; }

    DbSet<Vote> Votes { get; }

    Task<int> SaveChangesAsync(
        CancellationToken cancellationToken = default);
}