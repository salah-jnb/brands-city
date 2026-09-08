using System.Security.Claims;
using backendSHOP.Application.DTOs;
using backendSHOP.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backendSHOP.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.Parse(userIdClaim!);
    }

    private bool IsAdmin()
    {
        return User.IsInRole("Admin");
    }

    // Admin: Get all orders
    [HttpGet("all")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<List<OrderDto>>> GetAllOrders()
    {
        var orders = await _orderService.GetAllOrdersAsync();
        return Ok(orders);
    }

    // Client: Get my orders
    [HttpGet]
    [Authorize(Roles = "Client")]
    public async Task<ActionResult<List<OrderDto>>> GetMyOrders()
    {
        var orders = await _orderService.GetUserOrdersAsync(GetUserId());
        return Ok(orders);
    }

    // Get order by id
    [HttpGet("{id}")]
    public async Task<ActionResult<OrderDto>> GetById(int id)
    {
        var order = await _orderService.GetOrderByIdAsync(id);
        if (order == null) return NotFound();
        return Ok(order);
    }

    // Client: Create order from cart
    [HttpPost]
    [Authorize(Roles = "Client")]
    public async Task<ActionResult<OrderDto>> CreateOrder()
    {
        try
        {
            var order = await _orderService.CreateOrderFromCartAsync(GetUserId());
            return CreatedAtAction(nameof(GetById), new { id = order.Id }, order);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // Admin: Update order status
    [HttpPatch("{id}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<OrderDto>> UpdateStatus(int id, UpdateOrderStatusDto dto)
    {
        try
        {
            var order = await _orderService.UpdateOrderStatusAsync(id, dto.Status);
            return Ok(order);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
