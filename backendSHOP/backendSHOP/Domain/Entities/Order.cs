namespace backendSHOP.Domain.Entities;

public class Order
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public DateTime OrderDate { get; set; }
    public string Status { get; set; } = "Pending"; // Pending, Confirmed, Shipped, Delivered, Cancelled
    public decimal TotalAmount { get; set; }
    public List<OrderItem> Items { get; set; } = new();
}
