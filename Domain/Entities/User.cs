using Domain.Common;
using Domain.Enums;

namespace Domain.Entities;

public class User : BaseEntity
{
    public string Nickname { get; private set; } = default!;

    public string Email { get; private set; } = default!;

    public string PasswordHash { get; private set; } = default!;

    public string? AvatarUrl { get; private set; }

    public DateTime LastSeenAt { get; private set; }
        = DateTime.UtcNow;

    public bool IsOnline { get; private set; }

    public int Rating { get; private set; } = 1000;

    public UserRole Role { get; private set; }
        = UserRole.Player;

    public ICollection<RoomPlayer> Rooms
        = new List<RoomPlayer>();

    private User()
    {
    }

    public User(
        string nickname,
        string email,
        string passwordHash)
    {
        Nickname = nickname;
        Email = email;
        PasswordHash = passwordHash;
    }

    public User(
        string nickname,
        string email)
    {
        Nickname = nickname;
        Email = email;
        PasswordHash = string.Empty; 
    }

    public void SetOnline()
    {
        IsOnline = true;
        LastSeenAt = DateTime.UtcNow;
    }

    public void SetOffline()
    {
        IsOnline = false;
        LastSeenAt = DateTime.UtcNow;
    }

    public void UpdateRating(int newRating)
    {
        Rating = newRating;
        MarkUpdated();
    }

    public void ChangeAvatar(string? avatarUrl)
    {
        AvatarUrl = avatarUrl;
        MarkUpdated();
    }

    public void ChangeNickname(string nickname)
    {
        if (string.IsNullOrWhiteSpace(nickname))
            throw new ArgumentException("Нікнейм не може бути пустим", nameof(nickname));

        if (nickname.Length < 2 || nickname.Length > 20)
            throw new ArgumentException("Нікнейм має бути від 2 до 20 символів", nameof(nickname));

        Nickname = nickname.Trim();
        MarkUpdated();
    }

    public void ChangeRole(UserRole role)
    {
        Role = role;
        MarkUpdated();
    }
}