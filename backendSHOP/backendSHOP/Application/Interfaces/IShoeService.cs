using backendSHOP.Application.DTOs;
using Microsoft.AspNetCore.Http;

namespace backendSHOP.Application.Interfaces;

public interface IShoeService
{
    Task<List<ShoeDto>> GetAllAsync();
    Task<List<string>> GetBrandsAsync();
    Task<string> UploadImageAsync(IFormFile image, string? colorName = null);
    Task<ShoeDto?> GetByIdAsync(int id);
    Task<ShoeDto> CreateAsync(CreateShoeDto dto);
    Task<ShoeDto> UpdateAsync(int id, UpdateShoeDto dto);
    Task<ShoeDto> UpdateImageAsync(int id, IFormFile image);
    Task DeleteAsync(int id);
    Task<ShoeSizeDto> AddSizeAsync(int shoeId, AddShoeSizeDto dto);
    Task UpdateSizeStockAsync(int shoeId, int size, int quantity);
    Task DeleteSizeAsync(int shoeId, int size);
    Task<ShoeColorDto> AddColorAsync(int shoeId, AddShoeColorDto dto);
    Task<ShoeColorDto> UpdateColorImageAsync(int shoeId, int colorId, IFormFile image);
    Task DeleteColorAsync(int shoeId, int colorId);
}
