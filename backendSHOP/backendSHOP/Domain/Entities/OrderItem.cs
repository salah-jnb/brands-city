namespace backendSHOP.Domain.Entities;

public class OrderItem
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;
    public int ShoeId { get; set; }
    public Shoe Shoe { get; set; } = null!;
    public int ColorId { get; set; }
    public ShoeColor Color { get; set; } = null!;
    public int Size { get; set; }
    public int Quantity { get; set; }
    public decimal Price { get; set; } // Price at time of order
}
