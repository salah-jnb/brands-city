namespace backendSHOP.Application.DTOs;

// Auth DTOs
public record RegisterDto(string Email, string Password);
public record LoginDto(string Email, string Password);
public record AuthResponseDto(string Token, string Email, string Role);

// Shoe DTOs
public record ShoeSizeDto(int Id, int Size, int Quantity);
public record ShoeColorDto(int Id, string ColorName, string ColorCode, string ImageUrl);
public record ShoeDto(int Id, string Name, string Brand, decimal Price, string? ImageUrl, List<ShoeSizeDto> Sizes, List<ShoeColorDto> Colors);
public record CreateShoeDto(string Name, string Brand, decimal Price, List<CreateShoeSizeDto> Sizes, List<CreateShoeColorDto>? Colors);
public record CreateShoeSizeDto(int Size, int Quantity);
public record CreateShoeColorDto(string ColorName, string ColorCode);
public record UpdateShoeDto(string Name, string Brand, decimal Price);
public record AddShoeSizeDto(int Size, int Quantity);
public record AddShoeColorDto(string ColorName, string ColorCode, string? ImageUrl);
public record UpdateShoeSizeDto(int Quantity);

// Cart DTOs
public record CartDto(int Id, List<CartItemDto> Items, decimal Total);
public record CartItemDto(int Id, int ShoeId, string ShoeName, int ColorId, string ColorName, string ImageUrl, int Size, decimal Price, int Quantity);
public record AddToCartDto(int ShoeId, int ColorId, int Size, int Quantity);

// Order DTOs
public record OrderDto(int Id, DateTime OrderDate, string Status, decimal TotalAmount, List<OrderItemDto> Items);
public record OrderItemDto(int ShoeId, string ShoeName, int ColorId, string ColorName, string ImageUrl, int Size, int Quantity, decimal Price);
public record UpdateOrderStatusDto(string Status);
