using backendSHOP.Application.DTOs;

namespace backendSHOP.Application.Interfaces;

public interface ICartService
{
    Task<CartDto> GetCartAsync(int userId);
    Task<CartDto> AddToCartAsync(int userId, AddToCartDto dto);
    Task<CartDto> RemoveFromCartAsync(int userId, int shoeId);
    Task ClearCartAsync(int userId);
}
