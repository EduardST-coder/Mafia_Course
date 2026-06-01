using Application.Interfaces;
using Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Text.Json;

namespace Application.Features.Auth.GoogleLogin;

public class GoogleCallbackHandler
{
    private readonly IAppDbContext _context;
    private readonly IJwtProvider _jwtProvider;
    private readonly string _clientId;
    private readonly string _clientSecret;
    private readonly string _redirectUri;

    public GoogleCallbackHandler(
        IAppDbContext context,
        IJwtProvider jwtProvider,
        IConfiguration configuration)
    {
        _context = context;
        _jwtProvider = jwtProvider;
        _clientId = configuration["GoogleAuth:ClientId"]!;
        _clientSecret = configuration["GoogleAuth:ClientSecret"]!;
        _redirectUri = "https://localhost:7000/auth/google/callback"; // ЗМІНЕНО: бекенд, не фронтенд!
    }

    public async Task<IResult> Handle(string code, string state)
    {
        var tokenResponse = await ExchangeCodeForToken(code);

        if (tokenResponse == null || string.IsNullOrEmpty(tokenResponse.access_token))
        {
            return Results.BadRequest(new { Error = "Failed to exchange code for token" });
        }

        var userInfo = await GetGoogleUserInfo(tokenResponse.access_token);

        if (userInfo == null || string.IsNullOrEmpty(userInfo.email))
        {
            return Results.BadRequest(new { Error = "Failed to get user info" });
        }

        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.Email == userInfo.email);

        if (user is null)
        {
            user = new User(
                userInfo.name ?? userInfo.email.Split('@')[0],
                userInfo.email,
                Guid.NewGuid().ToString());

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
        }

        var token = _jwtProvider.Generate(user);

        // Редірект на фронтенд з токеном
        var redirectUrl = $"http://localhost:5173/login?token={token}";
        return Results.Redirect(redirectUrl);
    }

    private async Task<GoogleTokenResponse?> ExchangeCodeForToken(string code)
    {
        using var httpClient = new HttpClient();

        var content = new FormUrlEncodedContent(new Dictionary<string, string>
        {
            { "code", code },
            { "client_id", _clientId },
            { "client_secret", _clientSecret },
            { "redirect_uri", _redirectUri },
            { "grant_type", "authorization_code" }
        });

        var response = await httpClient.PostAsync("https://oauth2.googleapis.com/token", content);
        var json = await response.Content.ReadAsStringAsync();

        return JsonSerializer.Deserialize < GoogleTokenResponse > (json);
    }

    private async Task<GoogleUserInfo?> GetGoogleUserInfo(string accessToken)
    {
        using var httpClient = new HttpClient();
        httpClient.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

        var response = await httpClient.GetAsync("https://www.googleapis.com/oauth2/v2/userinfo");
        var json = await response.Content.ReadAsStringAsync();

        return JsonSerializer.Deserialize < GoogleUserInfo > (json);
    }
}

public class GoogleTokenResponse
{
    public string access_token { get; set; } = default!;
    public string token_type { get; set; } = default!;
    public int expires_in { get; set; }
    public string refresh_token { get; set; } = default!;
    public string scope { get; set; } = default!;
    public string id_token { get; set; } = default!;
}

public class GoogleUserInfo
{
    public string id { get; set; } = default!;
    public string email { get; set; } = default!;
    public string name { get; set; } = default!;
    public string picture { get; set; } = default!;
}