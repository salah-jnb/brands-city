using backendSHOP.Domain.Entities;

namespace backendSHOP.Domain.Interfaces;

public interface IOrderRepository
{
    Task<List<Order>> GetAllAsync();
    Task<List<Order>> GetByUserIdAsync(int userId);
    Task<Order?> GetByIdAsync(int id);
    Task<Order> CreateAsync(Order order);
    Task<Order> UpdateStatusAsync(int id, string status);
}
