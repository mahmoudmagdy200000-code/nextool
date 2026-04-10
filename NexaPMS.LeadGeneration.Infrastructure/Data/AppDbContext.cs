using Microsoft.EntityFrameworkCore;
using NexaPMS.LeadGeneration.Domain.Entities;

namespace NexaPMS.LeadGeneration.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; } = null!;
    public DbSet<HotelLead> HotelLeads { get; set; } = null!;
    public DbSet<MessageTemplate> MessageTemplates { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Username).IsUnique();
            entity.Property(e => e.Username).IsRequired().HasMaxLength(50);
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.Property(e => e.GoogleApiKey).HasMaxLength(255);
            entity.Property(e => e.GeminiApiKey).HasMaxLength(255);
            entity.Property(e => e.BusinessProfile).HasMaxLength(1500);
        });

        modelBuilder.Entity<HotelLead>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.PlaceId, e.UserId }).IsUnique();
            entity.Property(e => e.Name).IsRequired();
            entity.Property(e => e.UserId).IsRequired();

            entity.HasOne<User>()
                  .WithMany()
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<MessageTemplate>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Content).IsRequired();
            entity.Property(e => e.UserId).IsRequired();

            entity.HasOne<User>()
                  .WithMany()
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
