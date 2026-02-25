-- =============================================
-- Taonaire Internship Project - Sample Seed Data
-- SQL Server 2022
-- =============================================

USE taonaire_db;
GO

-- =============================================
-- Sample Users
-- Password for all test users: "Password123"
-- Bcrypt hash of "Password123" with 12 salt rounds
-- =============================================
INSERT INTO Users (name, email, password) VALUES
(N'Admin User', N'admin@example.com', N'$2a$12$LJ3m4ys3Lk0TSwMCkGKOmu8mFI.0pMR.dOBQRhFk6S8F9T2Ye3VZO'),
(N'Test User', N'test@example.com', N'$2a$12$LJ3m4ys3Lk0TSwMCkGKOmu8mFI.0pMR.dOBQRhFk6S8F9T2Ye3VZO'),
(N'សុខ សាន់', N'sok.san@example.com', N'$2a$12$LJ3m4ys3Lk0TSwMCkGKOmu8mFI.0pMR.dOBQRhFk6S8F9T2Ye3VZO');
GO

-- =============================================
-- Sample Categories (English & Khmer)
-- =============================================
INSERT INTO Categories (name, description) VALUES
(N'Electronics', N'Electronic devices and gadgets'),
(N'អេឡិចត្រូនិច', N'ឧបករណ៍អេឡិចត្រូនិច និងឧបករណ៍បច្ចេកវិទ្យា'),
(N'Clothing', N'Apparel and fashion items'),
(N'សម្លៀកបំពាក់', N'សម្លៀកបំពាក់ និងម៉ូដ'),
(N'Food & Beverages', N'Food items and drinks'),
(N'ម្ហូប និងភេសជ្ជៈ', N'ម្ហូបអាហារ និងភេសជ្ជៈ'),
(N'Books', N'Physical and digital books'),
(N'សៀវភៅ', N'សៀវភៅរូបវន្ត និងសៀវភៅឌីជីថល'),
(N'Home & Garden', N'Furniture and garden supplies'),
(N'ផ្ទះ និងសួន', N'គ្រឿងសង្ហារិម និងសម្ភារៈសួន');
GO

-- =============================================
-- Sample Products
-- =============================================
INSERT INTO Products (name, description, category_id, price, image_url) VALUES
-- Electronics
(N'Smartphone', N'Latest model smartphone with advanced features', 1, 699.99, N'smartphone.jpg'),
(N'Laptop', N'High-performance laptop for work and gaming', 1, 1299.99, N'laptop.jpg'),
(N'Wireless Earbuds', N'Noise-cancelling wireless earbuds', 1, 149.99, N'earbuds.jpg'),
(N'ទូរស័ព្ទ​ដៃ', N'ទូរស័ព្ទដៃស្មាតហ្វូនម៉ូដែលថ្មីបំផុត', 2, 599.99, N'phone_kh.jpg'),

-- Clothing
(N'T-Shirt', N'Cotton casual t-shirt', 3, 29.99, N't_shirt.jpg'),
(N'Jeans', N'Classic fit denim jeans', 3, 59.99, N'jeans.jpg'),
(N'អាវយឺត', N'អាវយឺតកប្បាសធម្មតា', 4, 24.99, N'tshirt_kh.jpg'),

-- Food & Beverages
(N'Green Tea', N'Organic green tea pack', 5, 12.99, N'green_tea.jpg'),
(N'Coffee Beans', N'Premium roasted coffee beans', 5, 18.99, N'coffee.jpg'),
(N'តែបៃតង', N'តែបៃតងសរីរាង្គ', 6, 11.99, N'tea_kh.jpg'),

-- Books
(N'Flutter in Action', N'Complete guide to Flutter development', 7, 39.99, N'flutter_book.jpg'),
(N'Node.js Design Patterns', N'Advanced Node.js patterns and practices', 7, 44.99, N'nodejs_book.jpg'),
(N'សៀវភៅរៀនកម្មវិធី', N'សៀវភៅណែនាំការសរសេរកម្មវិធី', 8, 34.99, N'programming_kh.jpg'),

-- Home & Garden
(N'Desk Lamp', N'LED desk lamp with adjustable brightness', 9, 34.99, N'desk_lamp.jpg'),
(N'Indoor Plant', N'Low-maintenance indoor green plant', 9, 19.99, N'plant.jpg'),
(N'ចង្កៀងតុ', N'ចង្កៀង LED សម្រាប់តុ', 10, 29.99, N'lamp_kh.jpg'),

-- Additional products for pagination testing
(N'Tablet', N'10-inch tablet with stylus support', 1, 499.99, N'tablet.jpg'),
(N'Smart Watch', N'Fitness tracking smart watch', 1, 249.99, N'smartwatch.jpg'),
(N'Bluetooth Speaker', N'Portable waterproof bluetooth speaker', 1, 79.99, N'speaker.jpg'),
(N'Keyboard', N'Mechanical gaming keyboard', 1, 129.99, N'keyboard.jpg'),
(N'Mouse', N'Wireless ergonomic mouse', 1, 49.99, N'mouse.jpg'),
(N'Monitor', N'27-inch 4K monitor', 1, 399.99, N'monitor.jpg'),
(N'Webcam', N'HD webcam for video calls', 1, 69.99, N'webcam.jpg'),
(N'Dress', N'Elegant evening dress', 3, 89.99, N'dress.jpg'),
(N'Sneakers', N'Comfortable running sneakers', 3, 74.99, N'sneakers.jpg'),
(N'Jacket', N'Waterproof winter jacket', 3, 119.99, N'jacket.jpg');
GO

PRINT 'Seed data inserted successfully.';
GO
