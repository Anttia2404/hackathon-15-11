require('dotenv').config();
const pool = require('./src/db/pool');

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('DB Config:', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
    });

    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully!');
    console.log('Current time:', result.rows[0].now);

    // Test if demo student exists
    const studentCheck = await pool.query(
      "SELECT * FROM students WHERE student_id = '00000000-0000-0000-0000-000000000001'"
    );
    
    if (studentCheck.rows.length > 0) {
      console.log('✅ Demo student exists:', studentCheck.rows[0]);
    } else {
      console.log('⚠️ Demo student not found. Run seed.sql first!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
