/**
 * Seed script: Download real product images + insert 5 categories & 20 products
 * Run: node seed-data-with-images.js
 */

require('dotenv').config();
const sql = require('mssql');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const dbConfig = {
  server: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433', 10),
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'taonaire_db',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
};

const UPLOAD_DIR = path.join(__dirname, 'uploads', 'images');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Free product images from Unsplash (no API key needed for direct URLs)
const categories = [
  { name: 'Electronics', description: 'Electronic devices, gadgets, and accessories' },
  { name: 'Clothing', description: 'Apparel, fashion items, and accessories' },
  { name: 'Food & Beverages', description: 'Food items, snacks, and drinks' },
  { name: 'Books & Stationery', description: 'Books, notebooks, and office supplies' },
  { name: 'Home & Garden', description: 'Furniture, decor, and garden supplies' },
];

const products = [
  // Electronics (category index 0)
  { name: 'Smartphone Pro Max', description: 'Latest flagship smartphone with 6.7" OLED display and 5G', categoryIdx: 0, price: 999.99, filename: 'smartphone.jpg', imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop' },
  { name: 'Laptop UltraBook', description: '14-inch lightweight laptop with 16GB RAM and 512GB SSD', categoryIdx: 0, price: 1299.99, filename: 'laptop.jpg', imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop' },
  { name: 'Wireless Earbuds', description: 'Active noise-cancelling earbuds with 8-hour battery life', categoryIdx: 0, price: 149.99, filename: 'earbuds.jpg', imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400&h=400&fit=crop' },
  { name: 'Smart Watch', description: 'Fitness tracking smartwatch with heart rate monitor and GPS', categoryIdx: 0, price: 249.99, filename: 'smartwatch.jpg', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop' },

  // Clothing (category index 1)
  { name: 'Classic T-Shirt', description: '100% cotton unisex t-shirt available in multiple colors', categoryIdx: 1, price: 24.99, filename: 'tshirt.jpg', imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop' },
  { name: 'Denim Jeans', description: 'Slim fit denim jeans with stretch comfort', categoryIdx: 1, price: 59.99, filename: 'jeans.jpg', imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop' },
  { name: 'Running Sneakers', description: 'Lightweight breathable running shoes with cushion sole', categoryIdx: 1, price: 89.99, filename: 'sneakers.jpg', imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop' },
  { name: 'Winter Jacket', description: 'Waterproof insulated winter jacket with hood', categoryIdx: 1, price: 129.99, filename: 'jacket.jpg', imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop' },

  // Food & Beverages (category index 2)
  { name: 'Organic Green Tea', description: 'Premium Japanese organic green tea - 100 bags', categoryIdx: 2, price: 14.99, filename: 'green_tea.jpg', imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop' },
  { name: 'Arabica Coffee Beans', description: 'Single origin roasted Arabica coffee beans 500g', categoryIdx: 2, price: 18.99, filename: 'coffee.jpg', imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop' },
  { name: 'Dark Chocolate Bar', description: '72% cacao dark chocolate bar - Belgian crafted', categoryIdx: 2, price: 6.99, filename: 'chocolate.jpg', imageUrl: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=400&h=400&fit=crop' },
  { name: 'Mixed Nuts Pack', description: 'Assorted roasted nuts - almonds, cashews, walnuts 400g', categoryIdx: 2, price: 12.49, filename: 'nuts.jpg', imageUrl: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400&h=400&fit=crop' },

  // Books & Stationery (category index 3)
  { name: 'Flutter Development Guide', description: 'Complete guide to building cross-platform apps with Flutter', categoryIdx: 3, price: 44.99, filename: 'flutter_book.jpg', imageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=400&fit=crop' },
  { name: 'Node.js in Action', description: 'Practical Node.js patterns for backend development', categoryIdx: 3, price: 39.99, filename: 'nodejs_book.jpg', imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop' },
  { name: 'Leather Notebook', description: 'A5 premium leather-bound notebook with 200 lined pages', categoryIdx: 3, price: 19.99, filename: 'notebook.jpg', imageUrl: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&h=400&fit=crop' },
  { name: 'Mechanical Pencil Set', description: 'Professional drafting pencil set with lead refills', categoryIdx: 3, price: 15.99, filename: 'pencil_set.jpg', imageUrl: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400&h=400&fit=crop' },

  // Home & Garden (category index 4)
  { name: 'LED Desk Lamp', description: 'Adjustable brightness LED desk lamp with USB charging port', categoryIdx: 4, price: 34.99, filename: 'desk_lamp.jpg', imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=400&h=400&fit=crop' },
  { name: 'Indoor Plant Pot Set', description: 'Set of 3 ceramic plant pots with drainage holes', categoryIdx: 4, price: 29.99, filename: 'plant_pots.jpg', imageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=400&fit=crop' },
  { name: 'Bamboo Shelf', description: '5-tier bamboo bookshelf for living room or office', categoryIdx: 4, price: 79.99, filename: 'shelf.jpg', imageUrl: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=400&h=400&fit=crop' },
  { name: 'Garden Tool Kit', description: '10-piece stainless steel garden tool set with carrying bag', categoryIdx: 4, price: 45.99, filename: 'garden_tools.jpg', imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop' },
];

/**
 * Download a file from a URL, following redirects
 */
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (response) => {
      // Follow redirects (Unsplash returns 301/302)
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: HTTP ${response.statusCode}`));
      }
      const fileStream = fs.createWriteStream(destPath);
      response.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve(destPath);
      });
      fileStream.on('error', (err) => {
        fs.unlinkSync(destPath);
        reject(err);
      });
    }).on('error', reject);
  });
}

async function seed() {
  let pool;
  try {
    // --- Step 1: Download images ---
    console.log('🖼️  Downloading product images from Unsplash...\n');
    for (const prod of products) {
      const destPath = path.join(UPLOAD_DIR, prod.filename);
      if (fs.existsSync(destPath)) {
        const stats = fs.statSync(destPath);
        if (stats.size > 1000) {
          console.log(`   ⏭️  ${prod.filename} already exists (${(stats.size / 1024).toFixed(0)} KB), skipping`);
          continue;
        }
      }
      try {
        await downloadFile(prod.imageUrl, destPath);
        const stats = fs.statSync(destPath);
        console.log(`   ✅ ${prod.filename} downloaded (${(stats.size / 1024).toFixed(0)} KB)`);
      } catch (err) {
        console.log(`   ⚠️  ${prod.filename} failed: ${err.message}`);
      }
    }

    // --- Step 2: Connect to DB ---
    pool = await new sql.ConnectionPool(dbConfig).connect();
    console.log('\n✅ Connected to SQL Server');

    // --- Step 3: Clear existing data ---
    console.log('\n🗑️  Clearing existing products and categories...');
    await pool.request().query('DELETE FROM Products');
    await pool.request().query('DELETE FROM Categories');
    await pool.request().query("DBCC CHECKIDENT ('Products', RESEED, 0)");
    await pool.request().query("DBCC CHECKIDENT ('Categories', RESEED, 0)");
    console.log('   Done.');

    // --- Step 4: Insert categories ---
    console.log('\n📂 Inserting 5 categories...');
    const categoryIds = [];
    for (const cat of categories) {
      const result = await pool
        .request()
        .input('name', sql.NVarChar(255), cat.name)
        .input('description', sql.NVarChar(sql.MAX), cat.description)
        .query('INSERT INTO Categories (name, description) OUTPUT INSERTED.id VALUES (@name, @description)');
      const id = result.recordset[0].id;
      categoryIds.push(id);
      console.log(`   ✅ Category ${id}: ${cat.name}`);
    }

    // --- Step 5: Insert products ---
    console.log('\n📦 Inserting 20 products...');
    for (const prod of products) {
      const catId = categoryIds[prod.categoryIdx];
      const result = await pool
        .request()
        .input('name', sql.NVarChar(255), prod.name)
        .input('description', sql.NVarChar(sql.MAX), prod.description)
        .input('categoryId', sql.Int, catId)
        .input('price', sql.Decimal(10, 2), prod.price)
        .input('imageUrl', sql.NVarChar(500), prod.filename)
        .query(`
          INSERT INTO Products (name, description, category_id, price, image_url)
          OUTPUT INSERTED.id
          VALUES (@name, @description, @categoryId, @price, @imageUrl)
        `);
      const id = result.recordset[0].id;
      console.log(`   ✅ Product ${id}: ${prod.name} ($${prod.price}) → ${categories[prod.categoryIdx].name} [${prod.filename}]`);
    }

    // --- Summary ---
    const catCount = await pool.request().query('SELECT COUNT(*) as cnt FROM Categories');
    const prodCount = await pool.request().query('SELECT COUNT(*) as cnt FROM Products');
    console.log('\n========================================');
    console.log(`🎉 Seed complete!`);
    console.log(`   Categories: ${catCount.recordset[0].cnt}`);
    console.log(`   Products:   ${prodCount.recordset[0].cnt}`);
    console.log(`   Images in:  ${UPLOAD_DIR}`);
    console.log('========================================\n');

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.close();
      console.log('🔌 Connection closed.');
    }
  }
}

seed();
