namespace backendSHOP.Domain.Entities;

public class ShoeColor
{
    public int Id { get; set; }
    public int ShoeId { get; set; }
    public Shoe Shoe { get; set; } = null!;
    public string ColorName { get; set; } = string.Empty;
    public string ColorCode { get; set; } = string.Empty; // Hex code like #000000
    public string ImageUrl { get; set; } = string.Empty;
}
