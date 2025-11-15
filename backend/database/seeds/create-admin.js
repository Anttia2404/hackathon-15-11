const bcrypt = require('bcryptjs');
const { sequelize } = require('../../src/config/database');

async function createAdmin() {
  try {
    console.log('🔐 Creating admin user...\n');

    // Hash password
    const password = 'admin123'; // Change this to your desired password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create admin user
    await sequelize.query(`
      INSERT INTO users (user_id, email, password_hash, full_name, user_type, is_active)
      VALUES (
        '550e8400-e29b-41d4-a716-446655440001',
        'admin@university.edu',
        '${passwordHash}',
        'Admin User',
        'admin',
        true
      )
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        full_name = EXCLUDED.full_name,
        user_type = EXCLUDED.user_type,
        is_active = EXCLUDED.is_active;
    `);

    console.log('✅ Admin user created successfully!');
    console.log('\n📧 Email: admin@university.edu');
    console.log('🔑 Password: admin123');
    console.log('\n⚠️  Please change the password after first login!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
}

createAdmin();
