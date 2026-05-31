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

public class CreateVoteHandlerTests
{
    [Fact]
    public async Task Should_Create_Vote()
    {
        var voterId = Guid.NewGuid();

        var targetId = Guid.NewGuid();

        var options =
            new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(
                    Guid.NewGuid().ToString())
                .Options;

        await using var context =
            new AppDbContext(options);

        var room =
            new Room(
                "Test",
                voterId,
                10,
                false,
                null);

        room.NextPhase();

        await context.Rooms.AddAsync(room);

        await context.RoomPlayers.AddRangeAsync(
            new RoomPlayer(
                room.Id,
                voterId,
                true),

            new RoomPlayer(
                room.Id,
                targetId,
                false));

        await context.SaveChangesAsync();

        var notifier =
            new Mock<IGameNotifier>();

        var handler =
            new CreateVoteHandler(
                context,
                notifier.Object);

        await handler.Handle(
            new CreateVoteRequest
            {
                RoomId = room.Id,
                VoterId = voterId,
                TargetId = targetId
            });

        context.Votes
            .Count()
            .Should()
            .Be(1);
    }

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
            new CreateVoteHandler(
                context,
                notifier.Object);

        var result =
            await handler.Handle(
                new CreateVoteRequest
                {
                    RoomId = Guid.NewGuid(),
                    VoterId = Guid.NewGuid(),
                    TargetId = Guid.NewGuid()
                });

        result.Should().NotBeNull();
    }

    [Fact]
    public async Task Should_Return_Error_When_Not_Day_Phase()
    {
        var voterId = Guid.NewGuid();

        var targetId = Guid.NewGuid();

        var options =
            new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(
                    Guid.NewGuid().ToString())
                .Options;

        await using var context =
            new AppDbContext(options);

        var room =
            new Room(
                "Test",
                voterId,
                10,
                false,
                null);

        await context.Rooms.AddAsync(room);

        await context.RoomPlayers.AddRangeAsync(
            new RoomPlayer(
                room.Id,
                voterId,
                true),

            new RoomPlayer(
                room.Id,
                targetId,
                false));

        await context.SaveChangesAsync();

        var notifier =
            new Mock<IGameNotifier>();

        var handler =
            new CreateVoteHandler(
                context,
                notifier.Object);

        var result =
            await handler.Handle(
                new CreateVoteRequest
                {
                    RoomId = room.Id,
                    VoterId = voterId,
                    TargetId = targetId
                });

        context.Votes
            .Count()
            .Should()
            .Be(0);
    }

    [Fact]
    public async Task Should_Return_Error_When_Voter_Is_Dead()
    {
        var voterId = Guid.NewGuid();

        var targetId = Guid.NewGuid();

        var options =
            new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(
                    Guid.NewGuid().ToString())
                .Options;

        await using var context =
            new AppDbContext(options);

        var room =
            new Room(
                "Test",
                voterId,
                10,
                false,
                null);

        room.NextPhase();

        var voter =
            new RoomPlayer(
                room.Id,
                voterId,
                true);

        voter.Kill();

        await context.Rooms.AddAsync(room);

        await context.RoomPlayers.AddRangeAsync(
            voter,

            new RoomPlayer(
                room.Id,
                targetId,
                false));

        await context.SaveChangesAsync();

        var notifier =
            new Mock<IGameNotifier>();

        var handler =
            new CreateVoteHandler(
                context,
                notifier.Object);

        var result =
            await handler.Handle(
                new CreateVoteRequest
                {
                    RoomId = room.Id,
                    VoterId = voterId,
                    TargetId = targetId
                });

        context.Votes
            .Count()
            .Should()
            .Be(0);
    }

    [Fact]
    public async Task Should_Return_Error_When_Player_Already_Voted()
    {
        var voterId = Guid.NewGuid();

        var targetId = Guid.NewGuid();

        var options =
            new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(
                    Guid.NewGuid().ToString())
                .Options;

        await using var context =
            new AppDbContext(options);

        var room =
            new Room(
                "Test",
                voterId,
                10,
                false,
                null);

        room.NextPhase();

        await context.Rooms.AddAsync(room);

        await context.RoomPlayers.AddRangeAsync(
            new RoomPlayer(
                room.Id,
                voterId,
                true),

            new RoomPlayer(
                room.Id,
                targetId,
                false));

        await context.Votes.AddAsync(
            new Vote(
                room.Id,
                voterId,
                targetId,
                room.Round));

        await context.SaveChangesAsync();

        var notifier =
            new Mock<IGameNotifier>();

        var handler =
            new CreateVoteHandler(
                context,
                notifier.Object);

        await handler.Handle(
            new CreateVoteRequest
            {
                RoomId = room.Id,
                VoterId = voterId,
                TargetId = targetId
            });

        context.Votes
            .Count()
            .Should()
            .Be(1);
    }
}