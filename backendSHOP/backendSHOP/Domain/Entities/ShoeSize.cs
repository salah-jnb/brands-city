namespace backendSHOP.Domain.Entities;

public class ShoeSize
{
    public int Id { get; set; }
    public int ShoeId { get; set; }
    public Shoe Shoe { get; set; } = null!;
    public int Size { get; set; }
    public int Quantity { get; set; } // Stock for this size
}
