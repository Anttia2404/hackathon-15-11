require('dotenv').config();
const pool = require('./src/db/pool');

async function clearTestData() {
  const client = await pool.connect();
  
  try {
    console.log('🧹 Clearing test data...\n');

    await client.query('BEGIN');

    // 1. Delete study plan tasks
    console.log('1️⃣ Deleting study plan tasks...');
    const tasksResult = await client.query(`
      DELETE FROM study_plan_tasks 
      WHERE plan_id IN (
        SELECT plan_id FROM study_plans 
        WHERE student_id = '00000000-0000-0000-0000-000000000001'
      )
    `);
    console.log(`   ✅ Deleted ${tasksResult.rowCount} task(s)`);

    // 2. Delete study plans
    console.log('2️⃣ Deleting study plans...');
    const plansResult = await client.query(`
      DELETE FROM study_plans 
      WHERE student_id = '00000000-0000-0000-0000-000000000001'
    `);
    console.log(`   ✅ Deleted ${plansResult.rowCount} plan(s)`);

    // 3. Delete deadlines
    console.log('3️⃣ Deleting deadlines...');
    const deadlinesResult = await client.query(`
      DELETE FROM deadlines 
      WHERE student_id = '00000000-0000-0000-0000-000000000001'
    `);
    console.log(`   ✅ Deleted ${deadlinesResult.rowCount} deadline(s)`);

    // 4. Delete timetable slots
    console.log('4️⃣ Deleting timetable slots...');
    const timetableResult = await client.query(`
      DELETE FROM timetable_slots 
      WHERE class_id IN (
        SELECT c.class_id FROM classes c
        JOIN class_enrollments ce ON c.class_id = ce.class_id
        WHERE ce.student_id = '00000000-0000-0000-0000-000000000001'
      )
    `);
    console.log(`   ✅ Deleted ${timetableResult.rowCount} timetable slot(s)`);

    // 5. Delete blocked times
    console.log('5️⃣ Deleting blocked times...');
    const blockedResult = await client.query(`
      DELETE FROM student_blocked_times 
      WHERE student_id = '00000000-0000-0000-0000-000000000001'
    `);
    console.log(`   ✅ Deleted ${blockedResult.rowCount} blocked time(s)`);

    await client.query('COMMIT');

    console.log('\n🎉 All test data cleared successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - Study plan tasks: ${tasksResult.rowCount}`);
    console.log(`   - Study plans: ${plansResult.rowCount}`);
    console.log(`   - Deadlines: ${deadlinesResult.rowCount}`);
    console.log(`   - Timetable slots: ${timetableResult.rowCount}`);
    console.log(`   - Blocked times: ${blockedResult.rowCount}`);
    console.log('\n✨ Database is now clean and ready for testing!');

    process.exit(0);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Error clearing test data:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

clearTestData();
