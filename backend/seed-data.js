/**
 * Seed script: Insert 5 categories and 20 products into the database
 * Run: node seed-data.js
 */

require('dotenv').config();
const sql = require('mssql');

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

const categories = [
  { name: 'Electronics', description: 'Electronic devices, gadgets, and accessories' },
  { name: 'Clothing', description: 'Apparel, fashion items, and accessories' },
  { name: 'Food & Beverages', description: 'Food items, snacks, and drinks' },
  { name: 'Books & Stationery', description: 'Books, notebooks, and office supplies' },
  { name: 'Home & Garden', description: 'Furniture, decor, and garden supplies' },
];

// Products will reference category IDs dynamically after insert
const products = [
  // Electronics (category index 0)
  { name: 'Smartphone Pro Max', description: 'Latest flagship smartphone with 6.7" OLED display and 5G', categoryIdx: 0, price: 999.99, image_url: 'smartphone.jpg' },
  { name: 'Laptop UltraBook', description: '14-inch lightweight laptop with 16GB RAM and 512GB SSD', categoryIdx: 0, price: 1299.99, image_url: 'laptop.jpg' },
  { name: 'Wireless Earbuds', description: 'Active noise-cancelling earbuds with 8-hour battery life', categoryIdx: 0, price: 149.99, image_url: 'earbuds.jpg' },
  { name: 'Smart Watch', description: 'Fitness tracking smartwatch with heart rate monitor and GPS', categoryIdx: 0, price: 249.99, image_url: 'smartwatch.jpg' },

  // Clothing (category index 1)
  { name: 'Classic T-Shirt', description: '100% cotton unisex t-shirt available in multiple colors', categoryIdx: 1, price: 24.99, image_url: 'tshirt.jpg' },
  { name: 'Denim Jeans', description: 'Slim fit denim jeans with stretch comfort', categoryIdx: 1, price: 59.99, image_url: 'jeans.jpg' },
  { name: 'Running Sneakers', description: 'Lightweight breathable running shoes with cushion sole', categoryIdx: 1, price: 89.99, image_url: 'sneakers.jpg' },
  { name: 'Winter Jacket', description: 'Waterproof insulated winter jacket with hood', categoryIdx: 1, price: 129.99, image_url: 'jacket.jpg' },

  // Food & Beverages (category index 2)
  { name: 'Organic Green Tea', description: 'Premium Japanese organic green tea - 100 bags', categoryIdx: 2, price: 14.99, image_url: 'green_tea.jpg' },
  { name: 'Arabica Coffee Beans', description: 'Single origin roasted Arabica coffee beans 500g', categoryIdx: 2, price: 18.99, image_url: 'coffee.jpg' },
  { name: 'Dark Chocolate Bar', description: '72% cacao dark chocolate bar - Belgian crafted', categoryIdx: 2, price: 6.99, image_url: 'chocolate.jpg' },
  { name: 'Mixed Nuts Pack', description: 'Assorted roasted nuts - almonds, cashews, walnuts 400g', categoryIdx: 2, price: 12.49, image_url: 'nuts.jpg' },

  // Books & Stationery (category index 3)
  { name: 'Flutter Development Guide', description: 'Complete guide to building cross-platform apps with Flutter', categoryIdx: 3, price: 44.99, image_url: 'flutter_book.jpg' },
  { name: 'Node.js in Action', description: 'Practical Node.js patterns for backend development', categoryIdx: 3, price: 39.99, image_url: 'nodejs_book.jpg' },
  { name: 'Leather Notebook', description: 'A5 premium leather-bound notebook with 200 lined pages', categoryIdx: 3, price: 19.99, image_url: 'notebook.jpg' },
  { name: 'Mechanical Pencil Set', description: 'Professional drafting pencil set with lead refills', categoryIdx: 3, price: 15.99, image_url: 'pencil_set.jpg' },

  // Home & Garden (category index 4)
  { name: 'LED Desk Lamp', description: 'Adjustable brightness LED desk lamp with USB charging port', categoryIdx: 4, price: 34.99, image_url: 'desk_lamp.jpg' },
  { name: 'Indoor Plant Pot Set', description: 'Set of 3 ceramic plant pots with drainage holes', categoryIdx: 4, price: 29.99, image_url: 'plant_pots.jpg' },
  { name: 'Bamboo Shelf', description: '5-tier bamboo bookshelf for living room or office', categoryIdx: 4, price: 79.99, image_url: 'shelf.jpg' },
  { name: 'Garden Tool Kit', description: '10-piece stainless steel garden tool set with carrying bag', categoryIdx: 4, price: 45.99, image_url: 'garden_tools.jpg' },
];

async function seed() {
  let pool;
  try {
    pool = await new sql.ConnectionPool(dbConfig).connect();
    console.log('✅ Connected to SQL Server');

    // --- Clear existing data (products first due to FK) ---
    console.log('\n🗑️  Clearing existing products and categories...');
    await pool.request().query('DELETE FROM Products');
    await pool.request().query('DELETE FROM Categories');
    // Reset identity seeds
    await pool.request().query('DBCC CHECKIDENT (\'Products\', RESEED, 0)');
    await pool.request().query('DBCC CHECKIDENT (\'Categories\', RESEED, 0)');
    console.log('   Done.');

    // --- Insert categories ---
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

    // --- Insert products ---
    console.log('\n📦 Inserting 20 products...');
    for (const prod of products) {
      const catId = categoryIds[prod.categoryIdx];
      const result = await pool
        .request()
        .input('name', sql.NVarChar(255), prod.name)
        .input('description', sql.NVarChar(sql.MAX), prod.description)
        .input('categoryId', sql.Int, catId)
        .input('price', sql.Decimal(10, 2), prod.price)
        .input('imageUrl', sql.NVarChar(500), prod.image_url)
        .query(`
          INSERT INTO Products (name, description, category_id, price, image_url)
          OUTPUT INSERTED.id
          VALUES (@name, @description, @categoryId, @price, @imageUrl)
        `);
      const id = result.recordset[0].id;
      console.log(`   ✅ Product ${id}: ${prod.name} ($${prod.price}) → Category: ${categories[prod.categoryIdx].name}`);
    }

    // --- Summary ---
    const catCount = await pool.request().query('SELECT COUNT(*) as cnt FROM Categories');
    const prodCount = await pool.request().query('SELECT COUNT(*) as cnt FROM Products');
    console.log('\n========================================');
    console.log(`🎉 Seed complete!`);
    console.log(`   Categories: ${catCount.recordset[0].cnt}`);
    console.log(`   Products:   ${prodCount.recordset[0].cnt}`);
    console.log('========================================\n');

  } catch (err) {
    console.error('❌ Error seeding data:', err.message);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.close();
      console.log('🔌 Connection closed.');
    }
  }
}

seed();
