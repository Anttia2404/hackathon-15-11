require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'hackathon',
  user: process.env.DB_USER || 'postgres',
  password: String(process.env.DB_PASSWORD || ''),
});

async function seedAll() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Seeding all data...\n');
    await client.query('BEGIN');

    // 1. Admin
    console.log('1️⃣ Creating Admin...');
    await client.query(`
      INSERT INTO users (email, password, full_name, user_type)
      VALUES ('admin@smartuni.edu.vn', '123', 'Administrator', 'admin')
      ON CONFLICT (email) DO UPDATE SET password = '123'
    `);
    console.log('   ✅ admin@smartuni.edu.vn / 123');

    // 2. Students
    console.log('\n2️⃣ Creating Students...');
    const students = [
      ['student1@smartuni.edu.vn', 'Nguyễn Văn A', 'SV001', 'Computer Science', 3, 3.5],
      ['student2@smartuni.edu.vn', 'Trần Thị B', 'SV002', 'IT', 2, 3.8],
      ['student3@smartuni.edu.vn', 'Lê Văn C', 'SV003', 'Software Engineering', 4, 3.2],
    ];

    for (const [email, name, code, major, year, gpa] of students) {
      const u = await client.query(`
        INSERT INTO users (email, password, full_name, user_type)
        VALUES ($1, '123', $2, 'student')
        ON CONFLICT (email) DO UPDATE SET password = '123'
        RETURNING user_id
      `, [email, name]);

      await client.query(`
        INSERT INTO students (user_id, student_code, major, year, gpa)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id) DO UPDATE SET student_code = $2, major = $3, year = $4, gpa = $5
      `, [u.rows[0].user_id, code, major, year, gpa]);

      console.log(`   ✅ ${email} / 123`);
    }

    // 3. Teachers
    console.log('\n3️⃣ Creating Teachers...');
    const teachers = [
      ['teacher1@smartuni.edu.vn', 'TS. Nguyễn Văn Giáo', 'GV001', 'Computer Science'],
      ['teacher2@smartuni.edu.vn', 'PGS. Trần Thị Sư', 'GV002', 'Software Engineering'],
    ];

    for (const [email, name, code, dept] of teachers) {
      const u = await client.query(`
        INSERT INTO users (email, password, full_name, user_type)
        VALUES ($1, '123', $2, 'teacher')
        ON CONFLICT (email) DO UPDATE SET password = '123'
        RETURNING user_id
      `, [email, name]);

      await client.query(`
        INSERT INTO teachers (user_id, teacher_code, department)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id) DO UPDATE SET teacher_code = $2, department = $3
      `, [u.rows[0].user_id, code, dept]);

      console.log(`   ✅ ${email} / 123`);
    }

    await client.query('COMMIT');

    console.log('\n' + '='.repeat(60));
    console.log('✅ All data seeded! All passwords: 123\n');
    console.log('📋 ACCOUNTS:\n');
    console.log('👨‍💼 ADMIN:');
    console.log('   admin@smartuni.edu.vn / 123\n');
    console.log('👨‍🎓 STUDENTS:');
    students.forEach(s => console.log(`   ${s[0]} / 123`));
    console.log('\n👨‍🏫 TEACHERS:');
    teachers.forEach(t => console.log(`   ${t[0]} / 123`));
    console.log('\n' + '='.repeat(60));

    process.exit(0);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    client.release();
  }
}

seedAll();
