const sql = require('mssql');
const fs = require('fs');
const path = require('path');

const dbConfig = {
  server: 'localhost',
  port: 1433,
  user: 'sa',
  password: 'Passw0rd123',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
};

async function initializeDatabase() {
  let pool;
  try {
    // Connect to master database first to create the taonaire_db
    const config = { ...dbConfig };
    delete config.database;
    
    pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log('Connected to SQL Server...');

    // Create database if it doesn't exist
    const createDbQuery = `
      IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'taonaire_db')
      BEGIN
          CREATE DATABASE taonaire_db;
      END
    `;
    
    await pool.request().query(createDbQuery);
    console.log('✅ Database created or already exists');
    
    await pool.close();
    
    // Now connect to taonaire_db and run schema
    const configWithDb = { ...dbConfig, database: 'taonaire_db' };
    pool = new sql.ConnectionPool(configWithDb);
    await pool.connect();
    console.log('Connected to taonaire_db...');

    // Read and execute schema
    const schemaPath = path.join(__dirname, '../sql/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    
    // Split by GO statements and execute
    const statements = schemaSql.split(/\bGO\b/gi);
    for (const statement of statements) {
      const trimmed = statement.trim();
      if (trimmed) {
        try {
          await pool.request().query(trimmed);
        } catch (e) {
          console.log('Statement error (may be expected):', e.message);
        }
      }
    }
    
    console.log('✅ Database schema initialized');
    
    // Check tables
    const result = await pool.request().query(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'
    `);
    console.log('Tables created:', result.recordset.map(row => row.TABLE_NAME).join(', '));
    
    await pool.close();
    console.log('✅ Database initialization complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error initializing database:', err);
    process.exit(1);
  }
}

initializeDatabase();
