using backendSHOP.Domain.Entities;

namespace backendSHOP.Domain.Interfaces;

public interface ICartRepository
{
    Task<Cart?> GetByUserIdAsync(int userId);
    Task<Cart> CreateAsync(Cart cart);
    Task<Cart> UpdateAsync(Cart cart);
    Task ClearCartAsync(int userId);
}
