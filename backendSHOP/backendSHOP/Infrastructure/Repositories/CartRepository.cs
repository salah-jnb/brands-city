using backendSHOP.Domain.Entities;
using backendSHOP.Domain.Interfaces;
using backendSHOP.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace backendSHOP.Infrastructure.Repositories;

public class CartRepository : ICartRepository
{
    private readonly AppDbContext _context;

    public CartRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Cart?> GetByUserIdAsync(int userId)
    {
        return await _context.Carts
            .Include(c => c.Items)
            .ThenInclude(i => i.Shoe)
            .FirstOrDefaultAsync(c => c.UserId == userId);
    }

    public async Task<Cart> CreateAsync(Cart cart)
    {
        _context.Carts.Add(cart);
        await _context.SaveChangesAsync();
        return cart;
    }

    public async Task<Cart> UpdateAsync(Cart cart)
    {
        _context.Carts.Update(cart);
        await _context.SaveChangesAsync();
        return cart;
    }

    public async Task ClearCartAsync(int userId)
    {
        var cart = await _context.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == userId);
        
        if (cart != null)
        {
            _context.CartItems.RemoveRange(cart.Items);
            await _context.SaveChangesAsync();
        }
    }
}
