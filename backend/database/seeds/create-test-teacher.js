const bcrypt = require('bcryptjs');
const { sequelize } = require('../../src/config/database');
const { v4: uuidv4 } = require('uuid');

async function createTestTeacher() {
  try {
    console.log('👨‍🏫 Creating test teacher...\n');

    const userId = uuidv4();
    const teacherId = uuidv4();
    const password = 'teacher123';
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    await sequelize.query(`
      INSERT INTO users (user_id, email, password_hash, full_name, user_type, is_active)
      VALUES (
        '${userId}',
        'teacher.test@university.edu',
        '${passwordHash}',
        'Nguyễn Văn A',
        'teacher',
        true
      )
      ON CONFLICT (email) DO NOTHING;
    `);

    // Create teacher profile
    await sequelize.query(`
      INSERT INTO teachers (teacher_id, user_id, teacher_code, department, specialization)
      VALUES (
        '${teacherId}',
        '${userId}',
        'TC001',
        'Khoa Công Nghệ Thông Tin',
        'Trí tuệ nhân tạo'
      )
      ON CONFLICT (teacher_code) DO NOTHING;
    `);

    console.log('✅ Test teacher created successfully!');
    console.log('\n📧 Email: teacher.test@university.edu');
    console.log('🔑 Password: teacher123');
    console.log('👤 Name: Nguyễn Văn A\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating teacher:', error.message);
    process.exit(1);
  }
}

createTestTeacher();
