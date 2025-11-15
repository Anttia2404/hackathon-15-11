const axios = require('axios');

async function testTeacherLogin() {
  try {
    console.log('🔐 Testing teacher login...\n');

    const API_URL = 'http://localhost:5000/api/v1';

    // Login as teacher
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'teacher.test@university.edu',
      password: 'teacher123'
    });

    console.log('✅ Login successful!');
    console.log('\nUser info:');
    console.log('  Name:', loginResponse.data.user.full_name);
    console.log('  Email:', loginResponse.data.user.email);
    console.log('  Type:', loginResponse.data.user.user_type);
    console.log('  Teacher ID:', loginResponse.data.user.teacher_id);

    const teacherId = loginResponse.data.user.teacher_id;

    // Get teacher's classes
    console.log('\n📚 Fetching teacher classes...');
    const classesResponse = await axios.get(`${API_URL}/analytics/teacher/${teacherId}/classes`);

    console.log('\n✅ Classes found:', classesResponse.data.total);
    classesResponse.data.classes.forEach((cls, idx) => {
      console.log(`\n${idx + 1}. ${cls.class_code} - ${cls.course_name}`);
      console.log(`   Students: ${cls.student_count}, Room: ${cls.room}`);
      console.log(`   ${cls.semester} ${cls.year}`);
    });

    console.log('\n✅ All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

testTeacherLogin();
