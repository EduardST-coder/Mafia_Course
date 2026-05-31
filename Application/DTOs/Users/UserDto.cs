namespace Application.DTOs.Users;

public class UserDto
{
    public Guid Id { get; set; }

    public string Nickname { get; set; } = default!;

    public string Email { get; set; } = default!;
}