using Application.DTOs.Rooms;
using Domain.Entities;
using Application.Interfaces;
using Microsoft.EntityFrameworkCore;  
using System;

namespace Application.Features.Rooms;

public class CreateRoomHandler
{
    private readonly IAppDbContext _context;

    public CreateRoomHandler(
        IAppDbContext context)
    {
        _context = context;
    }

    public async Task<RoomResponse> Handle(
        Guid ownerId,
        CreateRoomRequest request)
    {
        var room = new Room(
            request.Name,
            ownerId,
            request.MaxPlayers,
            request.IsPrivate,
            request.Password);

        var roomPlayer = new RoomPlayer(
            room.Id,
            ownerId,
            true);

        room.Players.Add(roomPlayer);

        await _context.Rooms.AddAsync(room);

        var owner = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == ownerId);

        await _context.SaveChangesAsync();

        return new RoomResponse
        {
            Id = room.Id,
            Name = room.Name,
            PlayersCount = 1,
            MaxPlayers = room.MaxPlayers,
            IsPrivate = room.IsPrivate,
            HostId = ownerId,                          
            HostName = owner?.Nickname ?? "Unknown"    
        };
    }
}