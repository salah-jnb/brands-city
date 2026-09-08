using backendSHOP.Application.DTOs;
using backendSHOP.Application.Interfaces;
using backendSHOP.Domain.Entities;
using backendSHOP.Domain.Interfaces;
using backendSHOP.Infrastructure.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace backendSHOP.Application.Services;

public class ShoeService : IShoeService
{
    private readonly IShoeRepository _shoeRepository;
    private readonly IWebHostEnvironment _environment;
    private readonly AppDbContext _context;

    public ShoeService(IShoeRepository shoeRepository, IWebHostEnvironment environment, AppDbContext context)
    {
        _shoeRepository = shoeRepository;
        _environment = environment;
        _context = context;
    }

    public async Task<List<ShoeDto>> GetAllAsync()
    {
        var shoes = await _shoeRepository.GetAllAsync();
        return shoes.Select(MapToDto).ToList();
    }

    public async Task<List<string>> GetBrandsAsync()
    {
        var shoes = await _shoeRepository.GetAllAsync();
        return shoes.Select(s => s.Brand).Distinct().OrderBy(b => b).ToList();
    }

    public async Task<ShoeDto?> GetByIdAsync(int id)
    {
        var shoe = await _shoeRepository.GetByIdAsync(id);
        if (shoe == null) return null;
        return MapToDto(shoe);
    }

    public async Task<ShoeDto> CreateAsync(CreateShoeDto dto)
    {
        var shoe = new Shoe
        {
            Name = dto.Name,
            Brand = dto.Brand,
            Price = dto.Price,
            Sizes = dto.Sizes.Select(s => new ShoeSize { Size = s.Size, Quantity = s.Quantity }).ToList()
        };

        // Add colors from DTO if provided
        if (dto.Colors != null && dto.Colors.Any())
        {
            foreach (var colorDto in dto.Colors)
            {
                shoe.Colors.Add(new ShoeColor
                {
                    ColorName = colorDto.ColorName,
                    ColorCode = colorDto.ColorCode,
                    ImageUrl = ""
                });
            }
            // Set first color's image as main image if available
            shoe.ImageUrl = shoe.Colors.FirstOrDefault()?.ImageUrl ?? "";
        }

        var created = await _shoeRepository.CreateAsync(shoe);
        return MapToDto(created);
    }

    public async Task<ShoeDto> UpdateAsync(int id, UpdateShoeDto dto)
    {
        var shoe = await _shoeRepository.GetByIdAsync(id);
        if (shoe == null) throw new Exception("Shoe not found");

        shoe.Name = dto.Name;
        shoe.Brand = dto.Brand;
        shoe.Price = dto.Price;

        var updated = await _shoeRepository.UpdateAsync(shoe);
        return MapToDto(updated);
    }

    public async Task<ShoeDto> UpdateImageAsync(int id, IFormFile image)
    {
        var shoe = await _shoeRepository.GetByIdAsync(id);
        if (shoe == null) throw new Exception("Shoe not found");

        // Delete old image if exists
        if (!string.IsNullOrEmpty(shoe.ImageUrl))
        {
            var oldPath = Path.Combine(_environment.WebRootPath, shoe.ImageUrl.TrimStart('/'));
            if (File.Exists(oldPath)) File.Delete(oldPath);
        }

        shoe.ImageUrl = await SaveImageAsync(image);
        var updated = await _shoeRepository.UpdateAsync(shoe);
        return MapToDto(updated);
    }

    public async Task DeleteAsync(int id)
    {
        var shoe = await _shoeRepository.GetByIdAsync(id);
        if (shoe != null)
        {
            // Delete main image
            if (!string.IsNullOrEmpty(shoe.ImageUrl))
            {
                var imagePath = Path.Combine(_environment.WebRootPath, shoe.ImageUrl.TrimStart('/'));
                if (File.Exists(imagePath)) File.Delete(imagePath);
            }
            // Delete color images
            foreach (var color in shoe.Colors)
            {
                if (!string.IsNullOrEmpty(color.ImageUrl))
                {
                    var colorImagePath = Path.Combine(_environment.WebRootPath, color.ImageUrl.TrimStart('/'));
                    if (File.Exists(colorImagePath)) File.Delete(colorImagePath);
                }
            }
        }
        await _shoeRepository.DeleteAsync(id);
    }

    public async Task<ShoeSizeDto> AddSizeAsync(int shoeId, AddShoeSizeDto dto)
    {
        var shoe = await _shoeRepository.GetByIdAsync(shoeId);
        if (shoe == null) throw new Exception("Shoe not found");

        var existingSize = shoe.Sizes.FirstOrDefault(s => s.Size == dto.Size);
        if (existingSize != null) throw new Exception("Size already exists");

        var newSize = new ShoeSize { ShoeId = shoeId, Size = dto.Size, Quantity = dto.Quantity };
        shoe.Sizes.Add(newSize);
        await _shoeRepository.UpdateAsync(shoe);

        return new ShoeSizeDto(newSize.Id, newSize.Size, newSize.Quantity);
    }

    public async Task UpdateSizeStockAsync(int shoeId, int size, int quantity)
    {
        var shoe = await _shoeRepository.GetByIdAsync(shoeId);
        if (shoe == null) throw new Exception("Shoe not found");

        var shoeSize = shoe.Sizes.FirstOrDefault(s => s.Size == size);
        if (shoeSize == null) throw new Exception("Size not found");

        shoeSize.Quantity = quantity;
        await _shoeRepository.UpdateAsync(shoe);
    }

    public async Task DeleteSizeAsync(int shoeId, int size)
    {
        await _shoeRepository.DeleteSizeAsync(shoeId, size);
    }

    public async Task<ShoeColorDto> AddColorAsync(int shoeId, AddShoeColorDto dto)
    {
        var shoe = await _shoeRepository.GetByIdAsync(shoeId);
        if (shoe == null) throw new Exception("Shoe not found");

        var imageUrl = dto.ImageUrl ?? shoe.ImageUrl ?? "";
        var newColor = new ShoeColor
        {
            ShoeId = shoeId,
            ColorName = dto.ColorName,
            ColorCode = dto.ColorCode,
            ImageUrl = imageUrl
        };

        shoe.Colors.Add(newColor);
        await _shoeRepository.UpdateAsync(shoe);

        return new ShoeColorDto(newColor.Id, newColor.ColorName, newColor.ColorCode, newColor.ImageUrl);
    }

    public async Task<ShoeColorDto> UpdateColorImageAsync(int shoeId, int colorId, IFormFile image)
    {
        var shoe = await _shoeRepository.GetByIdAsync(shoeId);
        if (shoe == null) throw new Exception("Shoe not found");

        var color = shoe.Colors.FirstOrDefault(c => c.Id == colorId);
        if (color == null) throw new Exception("Color not found");

        // Delete old image
        if (!string.IsNullOrEmpty(color.ImageUrl))
        {
            var oldPath = Path.Combine(_environment.WebRootPath, color.ImageUrl.TrimStart('/'));
            if (File.Exists(oldPath)) File.Delete(oldPath);
        }

        color.ImageUrl = await SaveImageAsync(image);
        await _context.SaveChangesAsync();

        return new ShoeColorDto(color.Id, color.ColorName, color.ColorCode, color.ImageUrl);
    }

    public async Task DeleteColorAsync(int shoeId, int colorId)
    {
        var color = await _context.ShoeColors.FindAsync(colorId);
        if (color != null && color.ShoeId == shoeId)
        {
            // Check if this is the last color and shoe has stock
            var colorCount = await _context.ShoeColors.CountAsync(c => c.ShoeId == shoeId);
            var totalStock = await _context.ShoeSizes.Where(s => s.ShoeId == shoeId).SumAsync(s => s.Quantity);
            
            if (colorCount <= 1 && totalStock > 0)
            {
                throw new InvalidOperationException("Impossible de supprimer la dernière couleur d'un produit avec du stock");
            }

            // Delete image file
            if (!string.IsNullOrEmpty(color.ImageUrl))
            {
                var imagePath = Path.Combine(_environment.WebRootPath, color.ImageUrl.TrimStart('/'));
                if (File.Exists(imagePath)) File.Delete(imagePath);
            }
            _context.ShoeColors.Remove(color);
            await _context.SaveChangesAsync();
        }
    }

    private async Task<string> SaveImageAsync(IFormFile image, string? customName = null)
    {
        var imagesPath = Path.Combine(_environment.WebRootPath, "images");
        if (!Directory.Exists(imagesPath)) Directory.CreateDirectory(imagesPath);

        var extension = Path.GetExtension(image.FileName);
        var sanitizedName = customName != null 
            ? string.Join("_", customName.Split(Path.GetInvalidFileNameChars()))
                .Replace(" ", "_")
                .ToLowerInvariant()
            : Guid.NewGuid().ToString();
        
        var fileName = $"{sanitizedName}_{DateTime.Now:yyyyMMdd_HHmmss}{extension}";
        var filePath = Path.Combine(imagesPath, fileName);

        using var stream = new FileStream(filePath, FileMode.Create);
        await image.CopyToAsync(stream);

        return $"/images/{fileName}";
    }

    public async Task<string> UploadImageAsync(IFormFile image, string? colorName = null)
    {
        return await SaveImageAsync(image, colorName);
    }

    private ShoeDto MapToDto(Shoe shoe)
    {
        var sizes = shoe.Sizes.Select(s => new ShoeSizeDto(s.Id, s.Size, s.Quantity)).ToList();
        var colors = shoe.Colors.Select(c => new ShoeColorDto(c.Id, c.ColorName, c.ColorCode, c.ImageUrl)).ToList();
        return new ShoeDto(shoe.Id, shoe.Name, shoe.Brand, shoe.Price, shoe.ImageUrl, sizes, colors);
    }
}
