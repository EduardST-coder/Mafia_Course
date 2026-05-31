using Application.Interfaces;

using Domain.Entities;

using Microsoft.EntityFrameworkCore;

namespace Persistence.Context;

public class AppDbContext
    : DbContext, IAppDbContext
{
    public AppDbContext(
        DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();

    public DbSet<Room> Rooms => Set<Room>();

    public DbSet<RoomPlayer> RoomPlayers
        => Set<RoomPlayer>();

    public DbSet<Vote> Votes
        => Set<Vote>();

    protected override void OnModelCreating(
        ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(AppDbContext).Assembly);

        base.OnModelCreating(modelBuilder);
    }
}