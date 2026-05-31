using Application.DTOs.Rooms;
using Application.Interfaces;

using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Rooms;

public class FinishVotingHandler
{
    private readonly IAppDbContext _context;

    private readonly IGameNotifier _notifier;

    public FinishVotingHandler(
        IAppDbContext context,
        IGameNotifier notifier)
    {
        _context = context;

        _notifier = notifier;
    }

    public async Task<IResult> Handle(
        FinishVotingRequest request)
    {
        var room = await _context.Rooms
            .FirstOrDefaultAsync(x =>
                x.Id == request.RoomId);

        if (room is null)
        {
            return Results.BadRequest(
                "Room not found");
        }

        if (room.OwnerId != request.UserId)
        {
            return Results.BadRequest(
                "Only owner can finish voting");
        }

        var votes = await _context.Votes
            .Where(x =>
                x.RoomId == request.RoomId &&
                x.Round == room.Round)
            .ToListAsync();

        if (!votes.Any())
        {
            return Results.BadRequest(
                "No votes found");
        }

        var groupedVotes = votes
            .GroupBy(x => x.TargetId)
            .Select(x => new
            {
                PlayerId = x.Key,
                Count = x.Count()
            })
            .OrderByDescending(x => x.Count)
            .ToList();

        var topVoteCount = groupedVotes
            .First()
            .Count;

        var topPlayers = groupedVotes
            .Where(x => x.Count == topVoteCount)
            .ToList();

        // TIE => START REVOTE
        if (topPlayers.Count > 1)
        {
            room.StartRevote(
                topPlayers
                    .Select(x => x.PlayerId)
                    .ToList());

            await _context.SaveChangesAsync();

            await _notifier.GameUpdated(
                room.Id);

            return Results.Ok(new
            {
                IsRevote = true,

                Players = topPlayers
                    .Select(x => x.PlayerId)
            });
        }

        var eliminatedPlayerId = topPlayers
            .First()
            .PlayerId;

        var player = await _context.RoomPlayers
            .FirstOrDefaultAsync(x =>
                x.RoomId == request.RoomId &&
                x.UserId == eliminatedPlayerId);

        if (player is null)
        {
            return Results.BadRequest(
                "Player not found");
        }

        player.Kill();

        await _context.SaveChangesAsync();

        await _notifier.GameUpdated(
            room.Id);

        return Results.Ok(
            new FinishVotingResponse
            {
                EliminatedPlayerId =
                    eliminatedPlayerId
            });
    }
}