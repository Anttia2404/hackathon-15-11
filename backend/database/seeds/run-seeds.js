const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function seedDatabase() {
  const client = await pool.connect();

  try {
    console.log('🌱 Starting database seeding...\n');

    await client.query('BEGIN');

    // ===== SEED USERS =====
    console.log('👤 Seeding users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Admin user
    const adminResult = await client.query(
      `
      INSERT INTO users (email, password_hash, full_name, user_type)
      VALUES ('admin@university.edu', $1, 'Admin User', 'admin')
      RETURNING user_id
    `,
      [hashedPassword]
    );

    // Teacher users
    const teacher1Result = await client.query(
      `
      INSERT INTO users (email, password_hash, full_name, user_type)
      VALUES ('nguyen.van.a@university.edu', $1, 'Nguyễn Văn A', 'teacher')
      RETURNING user_id
    `,
      [hashedPassword]
    );

    const teacher2Result = await client.query(
      `
      INSERT INTO users (email, password_hash, full_name, user_type)
      VALUES ('tran.thi.b@university.edu', $1, 'Trần Thị B', 'teacher')
      RETURNING user_id
    `,
      [hashedPassword]
    );

    // Student users
    const student1Result = await client.query(
      `
      INSERT INTO users (email, password_hash, full_name, user_type)
      VALUES ('minhanh@student.edu', $1, 'Lê Minh Anh', 'student')
      RETURNING user_id
    `,
      [hashedPassword]
    );

    const student2Result = await client.query(
      `
      INSERT INTO users (email, password_hash, full_name, user_type)
      VALUES ('vanbinh@student.edu', $1, 'Phạm Văn Bình', 'student')
      RETURNING user_id
    `,
      [hashedPassword]
    );

    const student3Result = await client.query(
      `
      INSERT INTO users (email, password_hash, full_name, user_type)
      VALUES ('thuc@student.edu', $1, 'Hoàng Thị C', 'student')
      RETURNING user_id
    `,
      [hashedPassword]
    );

    // ===== SEED TEACHERS =====
    console.log('👨‍🏫 Seeding teachers...');
    const teacherId1 = await client.query(
      `
      INSERT INTO teachers (user_id, teacher_code, department, specialization)
      VALUES ($1, 'TC001', 'Computer Science', 'Artificial Intelligence')
      RETURNING teacher_id
    `,
      [teacher1Result.rows[0].user_id]
    );

    const teacherId2 = await client.query(
      `
      INSERT INTO teachers (user_id, teacher_code, department, specialization)
      VALUES ($1, 'TC002', 'Computer Science', 'Database Systems')
      RETURNING teacher_id
    `,
      [teacher2Result.rows[0].user_id]
    );

    // ===== SEED STUDENTS =====
    console.log('👨‍🎓 Seeding students...');
    const studentId1 = await client.query(
      `
      INSERT INTO students (user_id, student_code, major, year, gpa, target_gpa)
      VALUES ($1, 'SV001', 'Computer Science', 3, 3.45, 3.70)
      RETURNING student_id
    `,
      [student1Result.rows[0].user_id]
    );

    const studentId2 = await client.query(
      `
      INSERT INTO students (user_id, student_code, major, year, gpa, target_gpa)
      VALUES ($1, 'SV002', 'Computer Science', 2, 2.80, 3.20)
      RETURNING student_id
    `,
      [student2Result.rows[0].user_id]
    );

    const studentId3 = await client.query(
      `
      INSERT INTO students (user_id, student_code, major, year, gpa, target_gpa)
      VALUES ($1, 'SV003', 'Information Technology', 3, 3.65, 3.80)
      RETURNING student_id
    `,
      [student3Result.rows[0].user_id]
    );

    // ===== SEED COURSES =====
    console.log('📚 Seeding courses...');
    const course1 = await client.query(`
      INSERT INTO courses (course_code, course_name, description, credits)
      VALUES ('CS301', 'Trí tuệ nhân tạo', 'Giới thiệu về AI, Machine Learning, Deep Learning', 3)
      RETURNING course_id
    `);

    const course2 = await client.query(`
      INSERT INTO courses (course_code, course_name, description, credits)
      VALUES ('CS205', 'Cơ sở dữ liệu', 'Thiết kế và quản trị cơ sở dữ liệu', 3)
      RETURNING course_id
    `);

    const course3 = await client.query(`
      INSERT INTO courses (course_code, course_name, description, credits)
      VALUES ('CS210', 'Mạng máy tính', 'Nguyên lý và giao thức mạng', 3)
      RETURNING course_id
    `);

    // ===== SEED CLASSES =====
    console.log('🏫 Seeding classes...');
    const class1 = await client.query(
      `
      INSERT INTO classes (course_id, teacher_id, class_code, semester, year, room, max_students)
      VALUES ($1, $2, 'CS301-01', 'Fall', 2025, 'A301', 50)
      RETURNING class_id
    `,
      [course1.rows[0].course_id, teacherId1.rows[0].teacher_id]
    );

    const class2 = await client.query(
      `
      INSERT INTO classes (course_id, teacher_id, class_code, semester, year, room, max_students)
      VALUES ($1, $2, 'CS205-01', 'Fall', 2025, 'B205', 45)
      RETURNING class_id
    `,
      [course2.rows[0].course_id, teacherId2.rows[0].teacher_id]
    );

    // ===== SEED ENROLLMENTS =====
    console.log('📝 Seeding enrollments...');
    await client.query(
      `
      INSERT INTO class_enrollments (class_id, student_id, status)
      VALUES 
        ($1, $2, 'active'),
        ($1, $3, 'active'),
        ($4, $2, 'active')
    `,
      [
        class1.rows[0].class_id,
        studentId1.rows[0].student_id,
        studentId2.rows[0].student_id,
        class2.rows[0].class_id,
      ]
    );

    // ===== SEED TIMETABLE =====
    console.log('📅 Seeding timetable...');
    await client.query(
      `
      INSERT INTO timetable_slots (class_id, day_of_week, start_time, end_time, room)
      VALUES 
        ($1, 'Monday', '08:00', '09:30', 'A301'),
        ($1, 'Wednesday', '08:00', '09:30', 'A301'),
        ($2, 'Tuesday', '10:00', '11:30', 'B205'),
        ($2, 'Thursday', '10:00', '11:30', 'B205')
    `,
      [class1.rows[0].class_id, class2.rows[0].class_id]
    );

    // ===== SEED STUDENT PREFERENCES =====
    console.log('⚙️ Seeding student preferences...');
    await client.query(
      `
      INSERT INTO student_preferences (student_id, sleep_hours, preferred_study_mode)
      VALUES 
        ($1, 7.5, 'normal'),
        ($2, 6.0, 'sprint'),
        ($3, 8.0, 'relaxed')
    `,
      [studentId1.rows[0].student_id, studentId2.rows[0].student_id, studentId3.rows[0].student_id]
    );

    // ===== SEED DEADLINES =====
    console.log('⏰ Seeding deadlines...');
    await client.query(
      `
      INSERT INTO deadlines (student_id, class_id, title, description, due_date, estimated_hours, priority, status)
      VALUES 
        ($1, $2, 'Bài tập lớn AI', 'Xây dựng chatbot với NLP', '2025-11-20 23:59:00', 15, 'high', 'pending'),
        ($1, $3, 'Project cơ sở dữ liệu', 'Thiết kế database cho hệ thống', '2025-11-25 23:59:00', 20, 'medium', 'pending'),
        ($4, $2, 'Seminar AI', 'Trình bày về Deep Learning', '2025-11-18 14:00:00', 8, 'urgent', 'in_progress')
    `,
      [
        studentId1.rows[0].student_id,
        class1.rows[0].class_id,
        class2.rows[0].class_id,
        studentId2.rows[0].student_id,
      ]
    );

    // ===== SEED STUDY HEALTH SCORES =====
    console.log('💪 Seeding study health scores...');
    await client.query(
      `
      INSERT INTO study_health_scores (student_id, score_date, overall_score, attendance_score, assignment_completion_score, performance_score)
      VALUES 
        ($1, CURRENT_DATE, 78, 92, 85, 76),
        ($2, CURRENT_DATE, 65, 70, 60, 65),
        ($3, CURRENT_DATE, 88, 95, 90, 85)
    `,
      [studentId1.rows[0].student_id, studentId2.rows[0].student_id, studentId3.rows[0].student_id]
    );

    // ===== SEED AT-RISK STUDENTS =====
    console.log('⚠️ Seeding at-risk students...');
    await client.query(
      `
      INSERT INTO at_risk_students (student_id, class_id, risk_level, attendance_rate, assignment_completion_rate, average_score, notes)
      VALUES ($1, $2, 'medium', 70.00, 60.00, 2.80, 'Cần theo dõi thêm về tỷ lệ tham gia lớp')
    `,
      [studentId2.rows[0].student_id, class1.rows[0].class_id]
    );

    await client.query('COMMIT');

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📋 Sample credentials:');
    console.log('   Admin: admin@university.edu / password123');
    console.log('   Teacher: nguyen.van.a@university.edu / password123');
    console.log('   Student: minhanh@student.edu / password123');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding error:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  seedDatabase().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = seedDatabase;
