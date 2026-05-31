using Application.DTOs.Rooms;
using Application.Interfaces;

using Domain.Entities;
using Domain.Enums;

using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Rooms;

public class CreateVoteHandler
{
    private readonly IAppDbContext _context;

    private readonly IGameNotifier _notifier;

    public CreateVoteHandler(
        IAppDbContext context,
        IGameNotifier notifier)
    {
        _context = context;

        _notifier = notifier;
    }

    public async Task<IResult> Handle(
        CreateVoteRequest request)
    {
        var room = await _context.Rooms
            .FirstOrDefaultAsync(x =>
                x.Id == request.RoomId);

        if (room is null)
        {
            return Results.BadRequest(
                "Room not found");
        }

        if (room.Phase != GamePhase.Day)
        {
            return Results.BadRequest(
                "Voting allowed only during day");
        }

        var voter = await _context.RoomPlayers
            .FirstOrDefaultAsync(x =>
                x.RoomId == request.RoomId &&
                x.UserId == request.VoterId);

        if (voter is null)
        {
            return Results.BadRequest(
                "Voter not found");
        }

        if (!voter.IsAlive)
        {
            return Results.BadRequest(
                "Dead players cannot vote");
        }

        var target = await _context.RoomPlayers
            .FirstOrDefaultAsync(x =>
                x.RoomId == request.RoomId &&
                x.UserId == request.TargetId);

        if (target is null)
        {
            return Results.BadRequest(
                "Target not found");
        }

        if (!target.IsAlive)
        {
            return Results.BadRequest(
                "Cannot vote dead player");
        }

        var alreadyVoted = await _context.Votes
            .AnyAsync(x =>
                x.RoomId == request.RoomId &&
                x.VoterId == request.VoterId &&
                x.Round == room.Round);

        if (alreadyVoted)
        {
            return Results.BadRequest(
                "Player already voted");
        }

        var vote = new Vote(
            request.RoomId,
            request.VoterId,
            request.TargetId,
            room.Round);

        await _context.Votes.AddAsync(vote);

        await _context.SaveChangesAsync();

        await _notifier.GameUpdated(
            room.Id);

        return Results.Ok();
    }
}