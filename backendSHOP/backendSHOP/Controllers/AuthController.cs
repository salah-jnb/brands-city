using backendSHOP.Application.DTOs;
using backendSHOP.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace backendSHOP.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableRateLimiting("auth")] // Protection anti-brute force
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto dto)
    {
        try
        {
            var result = await _authService.RegisterAsync(dto);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Registration failed for email: {Email}", dto.Email);
            // Ne pas exposer le message d'exception réel
            return BadRequest(new { message = "L'inscription a échoué. Veuillez réessayer." });
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
    {
        try
        {
            var result = await _authService.LoginAsync(dto);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Login failed for email: {Email}", dto.Email);
            // Message générique pour éviter l'énumération des utilisateurs
            return BadRequest(new { message = "Email ou mot de passe incorrect." });
        }
    }
}
