using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace Application.Features.Auth.GoogleLogin;

public class GoogleRedirectHandler
{
    private readonly string _clientId;
    private readonly string _redirectUri;

    public GoogleRedirectHandler(IConfiguration configuration)
    {
        _clientId = configuration["GoogleAuth:ClientId"]!;
        _redirectUri = "https://localhost:7000/auth/google/callback";
    }

    public IResult Handle()
    {
        var scope = Uri.EscapeDataString("openid email profile");
        var state = Guid.NewGuid().ToString();

        var googleUrl = $"https://accounts.google.com/o/oauth2/v2/auth?" +
            $"client_id={_clientId}" +
            $"&redirect_uri={Uri.EscapeDataString(_redirectUri)}" +
            $"&response_type=code" +
            $"&scope={scope}" +
            $"&state={state}" +
            $"&access_type=offline" +
            $"&prompt=consent";

        return Results.Redirect(googleUrl);
    }
}