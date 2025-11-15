const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'hackathon',
  user: 'postgres',
  password: '01218552666aE@',
});

async function checkUser() {
  const client = await pool.connect();

  try {
    const result = await client.query(`
      SELECT 
        u.user_id, 
        u.email, 
        u.user_type,
        s.student_id,
        s.student_code,
        t.teacher_id,
        t.teacher_code
      FROM users u
      LEFT JOIN students s ON u.user_id = s.user_id
      LEFT JOIN teachers t ON u.user_id = t.user_id
      WHERE u.email = 'daonguyennhatanh0910@gmail.com'
    `);

    if (result.rows.length === 0) {
      console.log('❌ User not found');
    } else {
      console.log('✅ User found:');
      console.log(result.rows[0]);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    pool.end();
  }
}

checkUser();
