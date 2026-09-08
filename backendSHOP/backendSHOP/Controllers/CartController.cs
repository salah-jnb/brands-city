using System.Security.Claims;
using backendSHOP.Application.DTOs;
using backendSHOP.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backendSHOP.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Client")]
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;

    public CartController(ICartService cartService)
    {
        _cartService = cartService;
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.Parse(userIdClaim!);
    }

    [HttpGet]
    public async Task<ActionResult<CartDto>> GetCart()
    {
        var cart = await _cartService.GetCartAsync(GetUserId());
        return Ok(cart);
    }

    [HttpPost("items")]
    public async Task<ActionResult<CartDto>> AddToCart(AddToCartDto dto)
    {
        try
        {
            var cart = await _cartService.AddToCartAsync(GetUserId(), dto);
            return Ok(cart);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("items/{shoeId}")]
    public async Task<ActionResult<CartDto>> RemoveFromCart(int shoeId)
    {
        try
        {
            var cart = await _cartService.RemoveFromCartAsync(GetUserId(), shoeId);
            return Ok(cart);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete]
    public async Task<ActionResult> ClearCart()
    {
        await _cartService.ClearCartAsync(GetUserId());
        return NoContent();
    }
}
