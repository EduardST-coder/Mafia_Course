using Application.DTOs.Rooms;
using Application.Interfaces;

using Domain.Entities;
using Domain.Enums;

using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Rooms;

public class CreateRevoteHandler
{
    private readonly IAppDbContext _context;

    private readonly IGameNotifier _notifier;

    public CreateRevoteHandler(
        IAppDbContext context,
        IGameNotifier notifier)
    {
        _context = context;

        _notifier = notifier;
    }

    public async Task<IResult> Handle(
        CreateRevoteRequest request)
    {
        var room = await _context.Rooms
            .FirstOrDefaultAsync(x =>
                x.Id == request.RoomId);

        if (room is null)
        {
            return Results.BadRequest(
                "Room not found");
        }

        if (!room.IsRevote)
        {
            return Results.BadRequest(
                "Revote is not active");
        }

        if (room.Phase != GamePhase.Day)
        {
            return Results.BadRequest(
                "Revote allowed only during day");
        }

        if (!room.RevotePlayerIds
            .Contains(request.TargetId))
        {
            return Results.BadRequest(
                "Target is not in revote");
        }

        var voter = await _context.RoomPlayers
            .FirstOrDefaultAsync(x =>
                x.RoomId == request.RoomId &&
                x.UserId == request.VoterId);

        if (voter is null || !voter.IsAlive)
        {
            return Results.BadRequest(
                "Invalid voter");
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