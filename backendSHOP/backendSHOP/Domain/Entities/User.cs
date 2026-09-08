namespace backendSHOP.Domain.Entities;

public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = "Client"; // "Admin" or "Client"
    public List<Order> Orders { get; set; } = new();
    public Cart? Cart { get; set; }
}
