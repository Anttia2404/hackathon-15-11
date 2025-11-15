require('dotenv').config();
const pool = require('./src/db/pool');

async function checkTimetable() {
  try {
    console.log('🔍 Checking timetable in database...\n');

    const studentId = '00000000-0000-0000-0000-000000000001';

    // Check student_blocked_times (imported timetable)
    const blockedResult = await pool.query(`
      SELECT 
        blocked_time_id,
        day_of_week,
        TO_CHAR(start_time, 'HH24:MI') as start_time,
        TO_CHAR(end_time, 'HH24:MI') as end_time,
        reason,
        created_at
      FROM student_blocked_times
      WHERE student_id = $1
      ORDER BY 
        CASE day_of_week
          WHEN 'Monday' THEN 1
          WHEN 'Tuesday' THEN 2
          WHEN 'Wednesday' THEN 3
          WHEN 'Thursday' THEN 4
          WHEN 'Friday' THEN 5
          WHEN 'Saturday' THEN 6
          WHEN 'Sunday' THEN 7
        END,
        start_time
    `, [studentId]);

    console.log(`📅 Found ${blockedResult.rows.length} imported timetable slot(s):\n`);
    
    if (blockedResult.rows.length === 0) {
      console.log('   ❌ No timetable slots found in database!');
      console.log('   This means the save operation is not working.\n');
    } else {
      blockedResult.rows.forEach((slot, idx) => {
        console.log(`${idx + 1}. ${slot.day_of_week} ${slot.start_time}-${slot.end_time}`);
        console.log(`   Title: ${slot.reason}`);
        console.log(`   Created: ${slot.created_at}`);
        console.log('');
      });
    }

    // Check timetable_slots (official class schedule)
    const classResult = await pool.query(`
      SELECT 
        ts.slot_id,
        ts.day_of_week,
        TO_CHAR(ts.start_time, 'HH24:MI') as start_time,
        TO_CHAR(ts.end_time, 'HH24:MI') as end_time,
        co.course_name,
        ts.room
      FROM timetable_slots ts
      JOIN classes c ON ts.class_id = c.class_id
      JOIN courses co ON c.course_id = co.course_id
      JOIN class_enrollments ce ON c.class_id = ce.class_id
      WHERE ce.student_id = $1 AND ce.status = 'active'
      ORDER BY 
        CASE ts.day_of_week
          WHEN 'Monday' THEN 1
          WHEN 'Tuesday' THEN 2
          WHEN 'Wednesday' THEN 3
          WHEN 'Thursday' THEN 4
          WHEN 'Friday' THEN 5
          WHEN 'Saturday' THEN 6
          WHEN 'Sunday' THEN 7
        END,
        ts.start_time
    `, [studentId]);

    console.log(`🏫 Found ${classResult.rows.length} official class schedule slot(s):\n`);
    
    if (classResult.rows.length === 0) {
      console.log('   ℹ️ No official class schedule (this is normal for demo).\n');
    } else {
      classResult.rows.forEach((slot, idx) => {
        console.log(`${idx + 1}. ${slot.day_of_week} ${slot.start_time}-${slot.end_time}`);
        console.log(`   Course: ${slot.course_name}`);
        console.log(`   Room: ${slot.room}`);
        console.log('');
      });
    }

    console.log('✅ Check complete!');
    console.log('\n💡 Note: Imported timetable is stored in student_blocked_times table.');
    console.log('   Official class schedule is stored in timetable_slots table.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking timetable:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

checkTimetable();
