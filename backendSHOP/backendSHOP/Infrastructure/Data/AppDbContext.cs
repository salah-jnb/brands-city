using backendSHOP.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace backendSHOP.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Shoe> Shoes => Set<Shoe>();
    public DbSet<ShoeSize> ShoeSizes => Set<ShoeSize>();
    public DbSet<ShoeColor> ShoeColors => Set<ShoeColor>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.Email).IsRequired().HasMaxLength(100);
            entity.Property(u => u.PasswordHash).IsRequired();
            entity.Property(u => u.Role).IsRequired().HasMaxLength(20);
        });

        // Shoe
        modelBuilder.Entity<Shoe>(entity =>
        {
            entity.HasKey(s => s.Id);
            entity.Property(s => s.Name).IsRequired().HasMaxLength(100);
            entity.Property(s => s.Brand).IsRequired().HasMaxLength(50);
            entity.Property(s => s.Price).HasPrecision(10, 2);
            entity.Property(s => s.ImageUrl).HasMaxLength(255);
        });

        // ShoeSize
        modelBuilder.Entity<ShoeSize>(entity =>
        {
            entity.HasKey(ss => ss.Id);
            entity.HasOne(ss => ss.Shoe)
                  .WithMany(s => s.Sizes)
                  .HasForeignKey(ss => ss.ShoeId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ShoeColor
        modelBuilder.Entity<ShoeColor>(entity =>
        {
            entity.HasKey(sc => sc.Id);
            entity.Property(sc => sc.ColorName).IsRequired().HasMaxLength(50);
            entity.Property(sc => sc.ColorCode).IsRequired().HasMaxLength(20);
            entity.Property(sc => sc.ImageUrl).IsRequired().HasMaxLength(255);
            entity.HasOne(sc => sc.Shoe)
                  .WithMany(s => s.Colors)
                  .HasForeignKey(sc => sc.ShoeId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Cart - One to One with User
        modelBuilder.Entity<Cart>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.HasOne(c => c.User)
                  .WithOne(u => u.Cart)
                  .HasForeignKey<Cart>(c => c.UserId);
        });

        // CartItem
        modelBuilder.Entity<CartItem>(entity =>
        {
            entity.HasKey(ci => ci.Id);
            entity.HasOne(ci => ci.Cart)
                  .WithMany(c => c.Items)
                  .HasForeignKey(ci => ci.CartId);
            entity.HasOne(ci => ci.Shoe)
                  .WithMany()
                  .HasForeignKey(ci => ci.ShoeId);
            entity.HasOne(ci => ci.Color)
                  .WithMany()
                  .HasForeignKey(ci => ci.ColorId);
        });

        // Order
        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(o => o.Id);
            entity.Property(o => o.Status).IsRequired().HasMaxLength(20);
            entity.Property(o => o.TotalAmount).HasPrecision(10, 2);
            entity.HasOne(o => o.User)
                  .WithMany(u => u.Orders)
                  .HasForeignKey(o => o.UserId);
        });

        // OrderItem
        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.HasKey(oi => oi.Id);
            entity.Property(oi => oi.Price).HasPrecision(10, 2);
            entity.HasOne(oi => oi.Order)
                  .WithMany(o => o.Items)
                  .HasForeignKey(oi => oi.OrderId);
            entity.HasOne(oi => oi.Shoe)
                  .WithMany()
                  .HasForeignKey(oi => oi.ShoeId);
            entity.HasOne(oi => oi.Color)
                  .WithMany()
                  .HasForeignKey(oi => oi.ColorId);
        });
    }
}
