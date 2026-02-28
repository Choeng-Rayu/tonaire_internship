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
        password NVARCHAR(255) NULL,
        google_id NVARCHAR(255) NULL,
        auth_provider NVARCHAR(20) NOT NULL DEFAULT 'local',
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE()
    );
END
GO

-- Migration: Add google_id and auth_provider columns if they don't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'google_id')
BEGIN
    ALTER TABLE Users ADD google_id NVARCHAR(255) NULL;
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'auth_provider')
BEGIN
    ALTER TABLE Users ADD auth_provider NVARCHAR(20) NOT NULL DEFAULT 'local';
END
GO

-- Migration: Make password nullable for Google OAuth users
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'password' AND is_nullable = 0)
BEGIN
    ALTER TABLE Users ALTER COLUMN password NVARCHAR(255) NULL;
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
-- Activity Logs Table (for middleware analytics)
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ActivityLogs' AND xtype='U')
BEGIN
    CREATE TABLE ActivityLogs (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NULL,
        method NVARCHAR(10) NOT NULL,
        path NVARCHAR(500) NOT NULL,
        status_code INT NULL,
        response_time_ms INT NULL,
        ip_address NVARCHAR(45) NULL,
        user_agent NVARCHAR(500) NULL,
        created_at DATETIME DEFAULT GETDATE(),
        CONSTRAINT FK_ActivityLogs_Users FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE SET NULL
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

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Users_GoogleId')
BEGIN
    CREATE INDEX IX_Users_GoogleId ON Users(google_id);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ActivityLogs_UserId')
BEGIN
    CREATE INDEX IX_ActivityLogs_UserId ON ActivityLogs(user_id);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ActivityLogs_CreatedAt')
BEGIN
    CREATE INDEX IX_ActivityLogs_CreatedAt ON ActivityLogs(created_at);
END
GO

PRINT 'Schema created successfully.';
GO
