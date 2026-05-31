using Application.DTOs.Rooms;
using Application.Interfaces;

using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Rooms;

public class FinishRevoteHandler
{
    private readonly IAppDbContext _context;

    private readonly IGameNotifier _notifier;

    public FinishRevoteHandler(
        IAppDbContext context,
        IGameNotifier notifier)
    {
        _context = context;

        _notifier = notifier;
    }

    public async Task<IResult> Handle(
        FinishRevoteRequest request)
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

        if (room.OwnerId != request.UserId)
        {
            return Results.BadRequest(
                "Only owner can finish revote");
        }

        var votes = await _context.Votes
            .Where(x =>
                x.RoomId == request.RoomId &&
                x.Round == room.Round)
            .ToListAsync();

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

        // TIE AGAIN => BOTH ELIMINATED
        if (topPlayers.Count > 1)
        {
            var eliminatedIds = topPlayers
                .Select(x => x.PlayerId)
                .ToList();

            var players = await _context.RoomPlayers
                .Where(x =>
                    x.RoomId == request.RoomId &&
                    eliminatedIds.Contains(x.UserId))
                .ToListAsync();

            foreach (var player in players)
            {
                player.Kill();
            }

            room.FinishRevote();

            await _context.SaveChangesAsync();

            await _notifier.GameUpdated(
                room.Id);

            return Results.Ok(new
            {
                EliminatedPlayers =
                    eliminatedIds
            });
        }

        var eliminatedPlayerId = topPlayers
            .First()
            .PlayerId;

        var eliminatedPlayer =
            await _context.RoomPlayers
                .FirstOrDefaultAsync(x =>
                    x.RoomId == request.RoomId &&
                    x.UserId == eliminatedPlayerId);

        if (eliminatedPlayer is null)
        {
            return Results.BadRequest(
                "Player not found");
        }

        eliminatedPlayer.Kill();

        room.FinishRevote();

        await _context.SaveChangesAsync();

        await _notifier.GameUpdated(
            room.Id);

        return Results.Ok(new
        {
            EliminatedPlayer =
                eliminatedPlayerId
        });
    }
}