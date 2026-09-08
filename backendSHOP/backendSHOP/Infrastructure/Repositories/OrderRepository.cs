using backendSHOP.Domain.Entities;
using backendSHOP.Domain.Interfaces;
using backendSHOP.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace backendSHOP.Infrastructure.Repositories;

public class OrderRepository : IOrderRepository
{
    private readonly AppDbContext _context;

    public OrderRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Order>> GetAllAsync()
    {
        return await _context.Orders
            .Include(o => o.Items)
                .ThenInclude(i => i.Shoe)
            .Include(o => o.Items)
                .ThenInclude(i => i.Color)
            .Include(o => o.User)
            .ToListAsync();
    }

    public async Task<List<Order>> GetByUserIdAsync(int userId)
    {
        return await _context.Orders
            .Include(o => o.Items)
                .ThenInclude(i => i.Shoe)
            .Include(o => o.Items)
                .ThenInclude(i => i.Color)
            .Where(o => o.UserId == userId)
            .ToListAsync();
    }

    public async Task<Order?> GetByIdAsync(int id)
    {
        return await _context.Orders
            .Include(o => o.Items)
                .ThenInclude(i => i.Shoe)
            .Include(o => o.Items)
                .ThenInclude(i => i.Color)
            .FirstOrDefaultAsync(o => o.Id == id);
    }

    public async Task<Order> CreateAsync(Order order)
    {
        _context.Orders.Add(order);
        await _context.SaveChangesAsync();
        return order;
    }

    public async Task<Order> UpdateStatusAsync(int id, string status)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order == null) throw new Exception("Order not found");
        
        order.Status = status;
        await _context.SaveChangesAsync();
        return order;
    }
}
