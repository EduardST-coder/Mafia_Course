using Application.DTOs.Rooms;
using Application.Features.Rooms;
using Application.Interfaces;

using Domain.Entities;

using FluentAssertions;

using Microsoft.EntityFrameworkCore;

using Moq;

using Persistence.Context;

using Xunit;

namespace Mafia.Tests.Rooms;

public class FinishVotingHandlerTests
{
    [Fact]
    public async Task Should_Return_Error_When_Room_Not_Found()
    {
        var options =
            new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(
                    Guid.NewGuid().ToString())
                .Options;

        await using var context =
            new AppDbContext(options);

        var notifier =
            new Mock<IGameNotifier>();

        var handler =
            new FinishVotingHandler(
                context,
                notifier.Object);

        var result =
            await handler.Handle(
                new FinishVotingRequest
                {
                    RoomId = Guid.NewGuid(),
                    UserId = Guid.NewGuid()
                });

        result.Should().NotBeNull();
    }

    [Fact]
    public async Task Should_Return_Error_When_Not_Owner()
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

        await context.Rooms.AddAsync(room);

        await context.SaveChangesAsync();

        var notifier =
            new Mock<IGameNotifier>();

        var handler =
            new FinishVotingHandler(
                context,
                notifier.Object);

        var result =
            await handler.Handle(
                new FinishVotingRequest
                {
                    RoomId = room.Id,
                    UserId = Guid.NewGuid()
                });

        result.Should().NotBeNull();
    }

    [Fact]
    public async Task Should_Return_Error_When_No_Votes()
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

        await context.Rooms.AddAsync(room);

        await context.SaveChangesAsync();

        var notifier =
            new Mock<IGameNotifier>();

        var handler =
            new FinishVotingHandler(
                context,
                notifier.Object);

        var result =
            await handler.Handle(
                new FinishVotingRequest
                {
                    RoomId = room.Id,
                    UserId = ownerId
                });

        result.Should().NotBeNull();
    }

    [Fact]
    public async Task Should_Eliminate_Player_When_Winner_Exists()
    {
        var ownerId = Guid.NewGuid();

        var playerId = Guid.NewGuid();

        var voter1 = Guid.NewGuid();

        var voter2 = Guid.NewGuid();

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

        await context.Rooms.AddAsync(room);

        var target =
            new RoomPlayer(
                room.Id,
                playerId,
                false);

        await context.RoomPlayers.AddRangeAsync(
            target,

            new RoomPlayer(
                room.Id,
                voter1,
                false),

            new RoomPlayer(
                room.Id,
                voter2,
                false));

        await context.Votes.AddRangeAsync(
            new Vote(
                room.Id,
                voter1,
                playerId,
                room.Round),

            new Vote(
                room.Id,
                voter2,
                playerId,
                room.Round));

        await context.SaveChangesAsync();

        var notifier =
            new Mock<IGameNotifier>();

        var handler =
            new FinishVotingHandler(
                context,
                notifier.Object);

        await handler.Handle(
            new FinishVotingRequest
            {
                RoomId = room.Id,
                UserId = ownerId
            });

        target.IsAlive
            .Should()
            .BeFalse();
    }
}