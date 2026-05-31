using Application.DTOs.Auth;
using Application.Interfaces;

using Domain.Entities;

namespace Application.Features.Auth.Register;

public class RegisterHandler
{
    private readonly IUserRepository _userRepository;

    private readonly IPasswordHasher _passwordHasher;

    private readonly IJwtProvider _jwtProvider;

    public RegisterHandler(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        IJwtProvider jwtProvider)
    {
        _userRepository = userRepository;

        _passwordHasher = passwordHasher;

        _jwtProvider = jwtProvider;
    }

    public async Task<AuthResponse> Handle(
        RegisterRequest request)
    {
        var exists = await _userRepository
            .ExistsByEmailAsync(
                request.Email);

        if (exists)
        {
            throw new Exception(
                "User already exists");
        }

        var passwordHash =
            _passwordHasher.Hash(
                request.Password);

        var nickname =
            $"Player_{Random.Shared.Next(
                10000,
                99999)}";

        var user = new User(
            nickname,
            request.Email,
            passwordHash);

        await _userRepository
            .AddAsync(user);

        await _userRepository
            .SaveChangesAsync();

        var token =
            _jwtProvider.Generate(user);

        return new AuthResponse
        {
            Token = token
        };
    }
}