-- =============================================
-- Taonaire Internship Project - Database Schema
-- SQL Server 2022
-- =============================================

-- Create database
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'taonaire_db')
BEGIN
    CREATE DATABASE taonaire_db;
END
GO

USE taonaire_db;
GO

-- =============================================
-- Users Table
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
BEGIN
    CREATE TABLE Users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL,
        email NVARCHAR(255) NOT NULL UNIQUE,
        password NVARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE()
    );
END
GO

-- =============================================
-- OTP Codes Table (for Forgot Password)
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='OtpCodes' AND xtype='U')
BEGIN
    CREATE TABLE OtpCodes (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL,
        otp VARCHAR(6) NOT NULL,
        expires_at DATETIME NOT NULL,
        used BIT DEFAULT 0,
        created_at DATETIME DEFAULT GETDATE(),
        CONSTRAINT FK_OtpCodes_Users FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
    );
END
GO

-- =============================================
-- Categories Table
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Categories' AND xtype='U')
BEGIN
    CREATE TABLE Categories (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(255) NOT NULL,
        description NVARCHAR(MAX) NULL,
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE()
    );
END
GO

-- =============================================
-- Products Table
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Products' AND xtype='U')
BEGIN
    CREATE TABLE Products (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(255) NOT NULL,
        description NVARCHAR(MAX) NULL,
        category_id INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        image_url NVARCHAR(500) NULL,
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE(),
        CONSTRAINT FK_Products_Categories FOREIGN KEY (category_id) REFERENCES Categories(id) ON DELETE CASCADE
    );
END
GO

-- =============================================
-- Indexes for performance
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Products_CategoryId')
BEGIN
    CREATE INDEX IX_Products_CategoryId ON Products(category_id);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Users_Email')
BEGIN
    CREATE INDEX IX_Users_Email ON Users(email);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_OtpCodes_UserId')
BEGIN
    CREATE INDEX IX_OtpCodes_UserId ON OtpCodes(user_id);
END
GO

PRINT 'Schema created successfully.';
GO
