const sql = require('mssql');

const dbConfig = {
  server: 'localhost',
  port: 1433,
  user: 'sa',
  password: 'Passw0rd123',
  database: 'taonaire_db',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
};

async function debugDatabase() {
  let pool;
  try {
    pool = new sql.ConnectionPool(dbConfig);
    await pool.connect();
    console.log('Connected to database...\n');

    // Check categories
    console.log('=== CATEGORIES ===');
    const catResult = await pool.request().query('SELECT * FROM Categories');
    console.log(catResult.recordset);

    // Check products
    console.log('\n=== PRODUCTS ===');
    const prodResult = await pool.request().query(`
      SELECT p.id, p.name, p.category_id, c.name AS category_name, p.price
      FROM Products p
      LEFT JOIN Categories c ON p.category_id = c.id
    `);
    console.log(prodResult.recordset);

    // Test filter query
    if (catResult.recordset.length > 0) {
      const testCatId = catResult.recordset[0].id;
      console.log(`\n=== TESTING FILTER FOR CATEGORY ID: ${testCatId} ===`);
      const filterResult = await pool.request()
        .input('categoryId', sql.Int, testCatId)
        .query(`
          SELECT p.id, p.name, p.category_id, c.name AS category_name
          FROM Products p
          LEFT JOIN Categories c ON p.category_id = c.id
          WHERE p.category_id = @categoryId
        `);
      console.log('Filtered results:', filterResult.recordset);
    }

    await pool.close();
    console.log('\nDatabase check complete!');
  } catch (err) {
    console.error('Error:', err);
  }
}

debugDatabase();
