require('dotenv').config();
const pool = require('./src/db/pool');

async function seedDemoStudent() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Seeding demo student...\n');

    await client.query('BEGIN');

    // 1. Insert demo user
    console.log('1️⃣ Creating demo user...');
    await client.query(`
      INSERT INTO users (user_id, email, password_hash, full_name, user_type)
      VALUES (
        '00000000-0000-0000-0000-000000000001',
        'demo@student.com',
        '$2b$10$demohashedpassword',
        'Demo Student',
        'student'
      )
      ON CONFLICT (user_id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name
    `);
    console.log('   ✅ Demo user created');

    // 2. Insert demo student
    console.log('2️⃣ Creating demo student profile...');
    await client.query(`
      INSERT INTO students (student_id, user_id, student_code, major, year, gpa)
      VALUES (
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000001',
        'DEMO001',
        'Computer Science',
        3,
        3.5
      )
      ON CONFLICT (student_id) DO UPDATE SET
        major = EXCLUDED.major,
        year = EXCLUDED.year,
        gpa = EXCLUDED.gpa
    `);
    console.log('   ✅ Demo student profile created');

    // 3. Insert demo preferences
    console.log('3️⃣ Creating demo preferences...');
    await client.query(`
      INSERT INTO student_preferences (
        student_id, 
        sleep_hours, 
        lunch_duration_minutes, 
        dinner_duration_minutes,
        no_study_after_time,
        no_study_on_sundays,
        preferred_study_mode
      )
      VALUES (
        '00000000-0000-0000-0000-000000000001',
        7,
        45,
        45,
        '23:00:00',
        false,
        'normal'
      )
      ON CONFLICT (student_id) DO UPDATE SET
        sleep_hours = EXCLUDED.sleep_hours,
        lunch_duration_minutes = EXCLUDED.lunch_duration_minutes,
        dinner_duration_minutes = EXCLUDED.dinner_duration_minutes
    `);
    console.log('   ✅ Demo preferences created');

    await client.query('COMMIT');

    console.log('\n🎉 Demo student seeded successfully!');
    console.log('\n📋 Demo Student Info:');
    console.log('   Student ID: 00000000-0000-0000-0000-000000000001');
    console.log('   Email: demo@student.com');
    console.log('   Name: Demo Student');
    console.log('   Code: DEMO001');
    console.log('   Major: Computer Science');
    console.log('   Year: 3');
    console.log('   GPA: 3.5');
    console.log('\n✨ You can now use the Smart Scheduler!');

    process.exit(0);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Error seeding demo student:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    client.release();
  }
}

seedDemoStudent();
