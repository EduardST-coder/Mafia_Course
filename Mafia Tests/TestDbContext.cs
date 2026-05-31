using Persistence.Context;

using Microsoft.EntityFrameworkCore;

namespace Mafia.Tests;

public class TestDbContext
    : AppDbContext
{
    public TestDbContext(
        DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }
}