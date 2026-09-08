using backendSHOP.Domain.Entities;
using backendSHOP.Domain.Interfaces;
using backendSHOP.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace backendSHOP.Infrastructure.Repositories;

public class ShoeRepository : IShoeRepository
{
    private readonly AppDbContext _context;

    public ShoeRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Shoe>> GetAllAsync()
    {
        return await _context.Shoes
            .Include(s => s.Sizes)
            .Include(s => s.Colors)
            .ToListAsync();
    }

    public async Task<Shoe?> GetByIdAsync(int id)
    {
        return await _context.Shoes
            .Include(s => s.Sizes)
            .Include(s => s.Colors)
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task<Shoe> CreateAsync(Shoe shoe)
    {
        _context.Shoes.Add(shoe);
        await _context.SaveChangesAsync();
        return shoe;
    }

    public async Task<Shoe> UpdateAsync(Shoe shoe)
    {
        _context.Shoes.Update(shoe);
        await _context.SaveChangesAsync();
        return shoe;
    }

    public async Task DeleteAsync(int id)
    {
        var shoe = await _context.Shoes.FindAsync(id);
        if (shoe != null)
        {
            _context.Shoes.Remove(shoe);
            await _context.SaveChangesAsync();
        }
    }

    public async Task DeleteSizeAsync(int shoeId, int size)
    {
        var shoeSize = await _context.ShoeSizes
            .FirstOrDefaultAsync(s => s.ShoeId == shoeId && s.Size == size);
        if (shoeSize != null)
        {
            _context.ShoeSizes.Remove(shoeSize);
            await _context.SaveChangesAsync();
        }
    }
}
