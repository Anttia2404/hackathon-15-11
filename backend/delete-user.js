const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'hackathon',
  user: 'postgres',
  password: 'Abcd1234',
});

async function deleteUser(email) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get user_id
    const userResult = await client.query('SELECT user_id, user_type FROM users WHERE email = $1', [
      email,
    ]);

    if (userResult.rows.length === 0) {
      console.log('❌ User not found:', email);
      return;
    }

    const { user_id, user_type } = userResult.rows[0];
    console.log(`🔍 Found user: ${email} (${user_type})`);

    // Delete from role-specific tables
    if (user_type === 'student') {
      await client.query('DELETE FROM students WHERE user_id = $1', [user_id]);
      console.log('✅ Deleted student record');
    } else if (user_type === 'teacher') {
      await client.query('DELETE FROM teachers WHERE user_id = $1', [user_id]);
      console.log('✅ Deleted teacher record');
    }

    // Delete user
    await client.query('DELETE FROM users WHERE user_id = $1', [user_id]);
    console.log('✅ Deleted user record');

    await client.query('COMMIT');
    console.log('✅ User deleted successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    pool.end();
  }
}

// Get email from command line
const email = process.argv[2];

if (!email) {
  console.log('Usage: node delete-user.js <email>');
  console.log('Example: node delete-user.js test@example.com');
  process.exit(1);
}

deleteUser(email);
