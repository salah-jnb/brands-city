using backendSHOP.Application.DTOs;
using backendSHOP.Application.Interfaces;
using backendSHOP.Domain.Entities;
using backendSHOP.Domain.Interfaces;
using backendSHOP.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace backendSHOP.Application.Services;

public class CartService : ICartService
{
    private readonly ICartRepository _cartRepository;
    private readonly IShoeRepository _shoeRepository;
    private readonly AppDbContext _context;

    public CartService(ICartRepository cartRepository, IShoeRepository shoeRepository, AppDbContext context)
    {
        _cartRepository = cartRepository;
        _shoeRepository = shoeRepository;
        _context = context;
    }

    public async Task<CartDto> GetCartAsync(int userId)
    {
        var cart = await GetOrCreateCartWithItemsAsync(userId);
        return MapToDto(cart);
    }

    public async Task<CartDto> AddToCartAsync(int userId, AddToCartDto dto)
    {
        var shoe = await _shoeRepository.GetByIdAsync(dto.ShoeId);
        if (shoe == null) throw new Exception("Shoe not found");

        var color = shoe.Colors.FirstOrDefault(c => c.Id == dto.ColorId);
        if (color == null) throw new Exception("Color not found");

        var shoeSize = shoe.Sizes.FirstOrDefault(s => s.Size == dto.Size);
        if (shoeSize == null) throw new Exception("Size not available");
        if (shoeSize.Quantity < dto.Quantity) throw new Exception("Not enough stock");

        var cart = await GetOrCreateCartAsync(userId);

        var existingItem = cart.Items.FirstOrDefault(i => 
            i.ShoeId == dto.ShoeId && i.Size == dto.Size && i.ColorId == dto.ColorId);
        
        if (existingItem != null)
        {
            existingItem.Quantity += dto.Quantity;
        }
        else
        {
            cart.Items.Add(new CartItem
            {
                ShoeId = dto.ShoeId,
                ColorId = dto.ColorId,
                Size = dto.Size,
                Quantity = dto.Quantity
            });
        }

        await _context.SaveChangesAsync();
        cart = await GetOrCreateCartWithItemsAsync(userId);
        return MapToDto(cart);
    }

    public async Task<CartDto> RemoveFromCartAsync(int userId, int shoeId)
    {
        var cart = await GetOrCreateCartWithItemsAsync(userId);

        var item = cart.Items.FirstOrDefault(i => i.ShoeId == shoeId);
        if (item != null)
        {
            _context.CartItems.Remove(item);
            await _context.SaveChangesAsync();
        }

        cart = await GetOrCreateCartWithItemsAsync(userId);
        return MapToDto(cart);
    }

    public async Task ClearCartAsync(int userId)
    {
        await _cartRepository.ClearCartAsync(userId);
    }

    private async Task<Cart> GetOrCreateCartAsync(int userId)
    {
        var cart = await _context.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart == null)
        {
            cart = new Cart { UserId = userId };
            _context.Carts.Add(cart);
            await _context.SaveChangesAsync();
        }

        return cart;
    }

    private async Task<Cart> GetOrCreateCartWithItemsAsync(int userId)
    {
        var cart = await _context.Carts
            .Include(c => c.Items)
                .ThenInclude(i => i.Shoe)
            .Include(c => c.Items)
                .ThenInclude(i => i.Color)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart == null)
        {
            cart = new Cart { UserId = userId };
            _context.Carts.Add(cart);
            await _context.SaveChangesAsync();
        }

        return cart;
    }

    private CartDto MapToDto(Cart cart)
    {
        var items = cart.Items.Select(i => new CartItemDto(
            i.Id,
            i.ShoeId,
            i.Shoe?.Name ?? "",
            i.ColorId,
            i.Color?.ColorName ?? "",
            i.Color?.ImageUrl ?? i.Shoe?.ImageUrl ?? "",
            i.Size,
            i.Shoe?.Price ?? 0,
            i.Quantity
        )).ToList();

        var total = items.Sum(i => i.Price * i.Quantity);
        return new CartDto(cart.Id, items, total);
    }
}
