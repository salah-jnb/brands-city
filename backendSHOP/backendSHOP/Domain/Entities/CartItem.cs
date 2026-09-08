namespace backendSHOP.Domain.Entities;

public class CartItem
{
    public int Id { get; set; }
    public int CartId { get; set; }
    public Cart Cart { get; set; } = null!;
    public int ShoeId { get; set; }
    public Shoe Shoe { get; set; } = null!;
    public int ColorId { get; set; }
    public ShoeColor Color { get; set; } = null!;
    public int Size { get; set; }
    public int Quantity { get; set; }
}
