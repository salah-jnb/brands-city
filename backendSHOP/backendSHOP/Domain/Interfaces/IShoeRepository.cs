using backendSHOP.Domain.Entities;

namespace backendSHOP.Domain.Interfaces;

public interface IShoeRepository
{
    Task<List<Shoe>> GetAllAsync();
    Task<Shoe?> GetByIdAsync(int id);
    Task<Shoe> CreateAsync(Shoe shoe);
    Task<Shoe> UpdateAsync(Shoe shoe);
    Task DeleteAsync(int id);
    Task DeleteSizeAsync(int shoeId, int size);
}
