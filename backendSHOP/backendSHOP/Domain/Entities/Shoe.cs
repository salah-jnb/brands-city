namespace backendSHOP.Domain.Entities;

public class Shoe
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; } // Default image (optional, use Colors instead)
    public List<ShoeSize> Sizes { get; set; } = new();
    public List<ShoeColor> Colors { get; set; } = new();
}
