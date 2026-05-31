using Application.DTOs.Auth;
using Application.Interfaces;

namespace Application.Features.Auth.Login;

public class LoginHandler
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtProvider _jwtProvider;

    public LoginHandler(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        IJwtProvider jwtProvider)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _jwtProvider = jwtProvider;
    }

    public async Task<AuthResponse> Handle(LoginRequest request)
    {
        var user = await _userRepository
            .GetByEmailAsync(request.Email);

        if (user is null)
        {
            throw new Exception("Invalid credentials");
        }

        var validPassword = _passwordHasher.Verify(
            request.Password,
            user.PasswordHash);

        if (!validPassword)
        {
            throw new Exception("Invalid credentials");
        }

        var token = _jwtProvider.Generate(user);

        return new AuthResponse
        {
            Token = token
        };
    }
}