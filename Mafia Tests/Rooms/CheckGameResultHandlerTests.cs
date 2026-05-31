using Application.Features.Rooms;

using Domain.Entities;
using Domain.Enums;

using FluentAssertions;

using Microsoft.EntityFrameworkCore;

using Persistence.Context;

using Xunit;

namespace Mafia.Tests.Rooms;

public class CheckGameResultHandlerTests
{
    [Fact]
    public async Task Should_Return_Red_Win()
    {
        var ownerId = Guid.NewGuid();

        var options =
            new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(
                    Guid.NewGuid().ToString())
                .Options;

        await using var context =
            new AppDbContext(options);

        var room =
            new Room(
                "Room",
                ownerId,
                10,
                false,
                null);

        var sheriff =
            new RoomPlayer(
                room.Id,
                Guid.NewGuid(),
                false);

        sheriff.SetRole(
            GameRole.Sheriff);

        var civilian =
            new RoomPlayer(
                room.Id,
                Guid.NewGuid(),
                false);

        civilian.SetRole(
            GameRole.Civilian);

        room.Players.Add(sheriff);

        room.Players.Add(civilian);

        await context.Rooms.AddAsync(room);

        await context.SaveChangesAsync();

        var handler =
            new CheckGameResultHandler(
                context);

        var result =
            await handler.Handle(
                room.Id);

        result.Should()
            .NotBeNull();
    }

    [Fact]
    public async Task Should_Return_Black_Win()
    {
        var ownerId = Guid.NewGuid();

        var options =
            new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(
                    Guid.NewGuid().ToString())
                .Options;

        await using var context =
            new AppDbContext(options);

        var room =
            new Room(
                "Room",
                ownerId,
                10,
                false,
                null);

        var mafia =
            new RoomPlayer(
                room.Id,
                Guid.NewGuid(),
                false);

        mafia.SetRole(
            GameRole.Mafia);

        var civilian =
            new RoomPlayer(
                room.Id,
                Guid.NewGuid(),
                false);

        civilian.SetRole(
            GameRole.Civilian);

        room.Players.Add(mafia);

        room.Players.Add(civilian);

        await context.Rooms.AddAsync(room);

        await context.SaveChangesAsync();

        var handler =
            new CheckGameResultHandler(
                context);

        var result =
            await handler.Handle(
                room.Id);

        result.Should()
            .NotBeNull();
    }

    [Fact]
    public async Task Should_Return_Game_Not_Finished()
    {
        var ownerId = Guid.NewGuid();

        var options =
            new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(
                    Guid.NewGuid().ToString())
                .Options;

        await using var context =
            new AppDbContext(options);

        var room =
            new Room(
                "Room",
                ownerId,
                10,
                false,
                null);

        var mafia =
            new RoomPlayer(
                room.Id,
                Guid.NewGuid(),
                false);

        mafia.SetRole(
            GameRole.Mafia);

        var sheriff =
            new RoomPlayer(
                room.Id,
                Guid.NewGuid(),
                false);

        sheriff.SetRole(
            GameRole.Sheriff);

        var civilian =
            new RoomPlayer(
                room.Id,
                Guid.NewGuid(),
                false);

        civilian.SetRole(
            GameRole.Civilian);

        room.Players.Add(mafia);

        room.Players.Add(sheriff);

        room.Players.Add(civilian);

        await context.Rooms.AddAsync(room);

        await context.SaveChangesAsync();

        var handler =
            new CheckGameResultHandler(
                context);

        var result =
            await handler.Handle(
                room.Id);

        result.Should()
            .NotBeNull();
    }
}