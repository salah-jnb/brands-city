using backendSHOP.Application.DTOs;
using backendSHOP.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backendSHOP.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ShoesController : ControllerBase
{
    private readonly IShoeService _shoeService;

    public ShoesController(IShoeService shoeService)
    {
        _shoeService = shoeService;
    }

    [HttpGet]
    public async Task<ActionResult<List<ShoeDto>>> GetAll()
    {
        var shoes = await _shoeService.GetAllAsync();
        return Ok(shoes);
    }

    [HttpGet("brands")]
    public async Task<ActionResult<List<string>>> GetBrands()
    {
        var brands = await _shoeService.GetBrandsAsync();
        return Ok(brands);
    }

    [HttpPost("upload-image")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<object>> UploadImage(IFormFile image, [FromForm] string? colorName = null)
    {
        if (image == null || image.Length == 0)
            return BadRequest(new { message = "No image provided" });

        var imageUrl = await _shoeService.UploadImageAsync(image, colorName);
        return Ok(new { imageUrl });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ShoeDto>> GetById(int id)
    {
        var shoe = await _shoeService.GetByIdAsync(id);
        if (shoe == null) return NotFound();
        return Ok(shoe);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ShoeDto>> Create([FromBody] CreateShoeDto dto)
    {
        var shoe = await _shoeService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = shoe.Id }, shoe);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ShoeDto>> Update(int id, [FromBody] UpdateShoeDto dto)
    {
        try
        {
            var shoe = await _shoeService.UpdateAsync(id, dto);
            return Ok(shoe);
        }
        catch (Exception ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPut("{id}/image")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ShoeDto>> UpdateImage(int id, IFormFile image)
    {
        try
        {
            var shoe = await _shoeService.UpdateImageAsync(id, image);
            return Ok(shoe);
        }
        catch (Exception ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> Delete(int id)
    {
        await _shoeService.DeleteAsync(id);
        return NoContent();
    }

    // Size management
    [HttpPost("{id}/sizes")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ShoeSizeDto>> AddSize(int id, AddShoeSizeDto dto)
    {
        try
        {
            var size = await _shoeService.AddSizeAsync(id, dto);
            return Ok(size);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPatch("{id}/sizes/{size}/stock")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> UpdateSizeStock(int id, int size, [FromBody] UpdateShoeSizeDto dto)
    {
        try
        {
            await _shoeService.UpdateSizeStockAsync(id, size, dto.Quantity);
            return Ok();
        }
        catch (Exception ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}/sizes/{size}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeleteSize(int id, int size)
    {
        await _shoeService.DeleteSizeAsync(id, size);
        return NoContent();
    }

    // Color management
    [HttpPost("{id}/colors")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ShoeColorDto>> AddColor(int id, [FromBody] AddShoeColorDto dto)
    {
        try
        {
            var color = await _shoeService.AddColorAsync(id, dto);
            return Ok(color);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}/colors/{colorId}/image")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ShoeColorDto>> UpdateColorImage(int id, int colorId, IFormFile image)
    {
        try
        {
            var color = await _shoeService.UpdateColorImageAsync(id, colorId, image);
            return Ok(color);
        }
        catch (Exception ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}/colors/{colorId}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeleteColor(int id, int colorId)
    {
        try
        {
            await _shoeService.DeleteColorAsync(id, colorId);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
