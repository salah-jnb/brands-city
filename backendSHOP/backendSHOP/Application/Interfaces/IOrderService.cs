using backendSHOP.Application.DTOs;

namespace backendSHOP.Application.Interfaces;

public interface IOrderService
{
    Task<List<OrderDto>> GetAllOrdersAsync();
    Task<List<OrderDto>> GetUserOrdersAsync(int userId);
    Task<OrderDto?> GetOrderByIdAsync(int id);
    Task<OrderDto> CreateOrderFromCartAsync(int userId);
    Task<OrderDto> UpdateOrderStatusAsync(int id, string status);
}
