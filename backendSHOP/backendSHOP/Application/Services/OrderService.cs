using backendSHOP.Application.DTOs;
using backendSHOP.Application.Interfaces;
using backendSHOP.Domain.Entities;
using backendSHOP.Domain.Interfaces;
using backendSHOP.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace backendSHOP.Application.Services;

public class OrderService : IOrderService
{
    private readonly IOrderRepository _orderRepository;
    private readonly ICartRepository _cartRepository;
    private readonly IShoeRepository _shoeRepository;
    private readonly AppDbContext _context;

    public OrderService(IOrderRepository orderRepository, ICartRepository cartRepository, IShoeRepository shoeRepository, AppDbContext context)
    {
        _orderRepository = orderRepository;
        _cartRepository = cartRepository;
        _shoeRepository = shoeRepository;
        _context = context;
    }

    public async Task<List<OrderDto>> GetAllOrdersAsync()
    {
        var orders = await _orderRepository.GetAllAsync();
        return orders.Select(MapToDto).ToList();
    }

    public async Task<List<OrderDto>> GetUserOrdersAsync(int userId)
    {
        var orders = await _orderRepository.GetByUserIdAsync(userId);
        return orders.Select(MapToDto).ToList();
    }

    public async Task<OrderDto?> GetOrderByIdAsync(int id)
    {
        var order = await _orderRepository.GetByIdAsync(id);
        return order == null ? null : MapToDto(order);
    }

    public async Task<OrderDto> CreateOrderFromCartAsync(int userId)
    {
        var cart = await _context.Carts
            .Include(c => c.Items)
                .ThenInclude(i => i.Shoe)
            .Include(c => c.Items)
                .ThenInclude(i => i.Color)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart == null || !cart.Items.Any())
            throw new Exception("Cart is empty");

        // Check stock and calculate total
        decimal total = 0;
        foreach (var item in cart.Items)
        {
            var shoe = await _shoeRepository.GetByIdAsync(item.ShoeId);
            if (shoe == null) throw new Exception($"Shoe {item.ShoeId} not found");
            
            var shoeSize = shoe.Sizes.FirstOrDefault(s => s.Size == item.Size);
            if (shoeSize == null) throw new Exception($"Size {item.Size} not available for {shoe.Name}");
            if (shoeSize.Quantity < item.Quantity) throw new Exception($"Not enough stock for {shoe.Name} size {item.Size}");
            
            total += shoe.Price * item.Quantity;
        }

        // Create order
        var order = new Order
        {
            UserId = userId,
            OrderDate = DateTime.UtcNow,
            Status = "Pending",
            TotalAmount = total,
            Items = cart.Items.Select(i => new OrderItem
            {
                ShoeId = i.ShoeId,
                ColorId = i.ColorId,
                Size = i.Size,
                Quantity = i.Quantity,
                Price = i.Shoe?.Price ?? 0
            }).ToList()
        };

        // Update stock
        foreach (var item in cart.Items)
        {
            var shoe = await _shoeRepository.GetByIdAsync(item.ShoeId);
            if (shoe != null)
            {
                var shoeSize = shoe.Sizes.FirstOrDefault(s => s.Size == item.Size);
                if (shoeSize != null)
                {
                    shoeSize.Quantity -= item.Quantity;
                    await _shoeRepository.UpdateAsync(shoe);
                }
            }
        }

        var createdOrder = await _orderRepository.CreateAsync(order);
        await _cartRepository.ClearCartAsync(userId);

        return MapToDto(createdOrder);
    }

    public async Task<OrderDto> UpdateOrderStatusAsync(int id, string status)
    {
        var validStatuses = new[] { "Pending", "Confirmed", "Shipped", "Delivered", "Cancelled" };
        if (!validStatuses.Contains(status))
            throw new Exception("Invalid status");

        var order = await _orderRepository.UpdateStatusAsync(id, status);
        return MapToDto(order);
    }

    private OrderDto MapToDto(Order order)
    {
        var items = order.Items.Select(i => new OrderItemDto(
            i.ShoeId,
            i.Shoe?.Name ?? "",
            i.ColorId,
            i.Color?.ColorName ?? "",
            i.Color?.ImageUrl ?? i.Shoe?.ImageUrl ?? "",
            i.Size,
            i.Quantity,
            i.Price
        )).ToList();

        return new OrderDto(order.Id, order.OrderDate, order.Status, order.TotalAmount, items);
    }
}
