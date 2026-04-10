IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
CREATE TABLE [Users] (
    [Id] nvarchar(450) NOT NULL,
    [Username] nvarchar(50) NOT NULL,
    [PasswordHash] nvarchar(max) NOT NULL,
    [GoogleApiKey] nvarchar(255) NULL,
    [GeminiApiKey] nvarchar(255) NULL,
    [BusinessProfile] nvarchar(1500) NULL,
    CONSTRAINT [PK_Users] PRIMARY KEY ([Id])
);

CREATE TABLE [HotelLeads] (
    [Id] nvarchar(450) NOT NULL,
    [PlaceId] nvarchar(450) NOT NULL,
    [Name] nvarchar(max) NOT NULL,
    [PhoneNumber] nvarchar(max) NOT NULL,
    [Rating] float NOT NULL,
    [TotalReviews] int NOT NULL,
    [BusinessType] nvarchar(max) NOT NULL,
    [Address] nvarchar(max) NOT NULL,
    [Status] nvarchar(max) NOT NULL,
    [UserId] nvarchar(450) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_HotelLeads] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_HotelLeads_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [MessageTemplates] (
    [Id] nvarchar(450) NOT NULL,
    [Name] nvarchar(100) NOT NULL,
    [Content] nvarchar(max) NOT NULL,
    [UserId] nvarchar(450) NOT NULL,
    CONSTRAINT [PK_MessageTemplates] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_MessageTemplates_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
);

CREATE UNIQUE INDEX [IX_HotelLeads_PlaceId_UserId] ON [HotelLeads] ([PlaceId], [UserId]);

CREATE INDEX [IX_HotelLeads_UserId] ON [HotelLeads] ([UserId]);

CREATE INDEX [IX_MessageTemplates_UserId] ON [MessageTemplates] ([UserId]);

CREATE UNIQUE INDEX [IX_Users_Username] ON [Users] ([Username]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260405192436_InitialCreate', N'10.0.5');

COMMIT;
GO

