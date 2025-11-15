require('dotenv').config();
const pool = require('./src/db/pool');

async function testLoadPlans() {
  try {
    const studentId = '00000000-0000-0000-0000-000000000001';
    const today = new Date().toISOString().split('T')[0];
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);
    const endDateStr = endDate.toISOString().split('T')[0];

    console.log('🔍 Testing load plans API...\n');
    console.log(`Student ID: ${studentId}`);
    console.log(`Date range: ${today} to ${endDateStr}\n`);

    const result = await pool.query(`
      SELECT 
        sp.plan_id,
        sp.plan_date,
        sp.study_mode as "studyMode",
        sp.ai_summary as summary,
        json_agg(
          json_build_object(
            'id', spt.task_id,
            'taskName', spt.task_name,
            'startTime', TO_CHAR(spt.start_time, 'HH24:MI'),
            'endTime', TO_CHAR(spt.end_time, 'HH24:MI'),
            'duration', spt.duration_minutes,
            'category', spt.category,
            'isCompleted', spt.is_completed
          ) ORDER BY spt.start_time
        ) as tasks
      FROM study_plans sp
      LEFT JOIN study_plan_tasks spt ON sp.plan_id = spt.plan_id
      WHERE sp.student_id = $1
        AND sp.plan_date BETWEEN $2 AND $3
      GROUP BY sp.plan_id, sp.plan_date, sp.study_mode, sp.ai_summary 
      ORDER BY sp.plan_date
    `, [studentId, today, endDateStr]);

    console.log(`📊 Found ${result.rows.length} plan(s):\n`);

    if (result.rows.length === 0) {
      console.log('❌ No plans found! This is why reload shows empty.');
      console.log('\nPossible reasons:');
      console.log('1. Date range is wrong');
      console.log('2. Plans are outside the date range');
      console.log('3. Student ID mismatch');
    } else {
      result.rows.forEach((plan, idx) => {
        console.log(`${idx + 1}. Plan Date: ${plan.plan_date}`);
        console.log(`   Study Mode: ${plan.studyMode}`);
        console.log(`   Summary: ${plan.summary?.substring(0, 50)}...`);
        console.log(`   Tasks: ${plan.tasks.filter(t => t.taskName).length}`);
        
        if (plan.tasks && plan.tasks[0]?.taskName) {
          plan.tasks.forEach((task, i) => {
            console.log(`     ${i + 1}. ${task.startTime}-${task.endTime}: ${task.taskName}`);
          });
        }
        console.log('');
      });

      console.log('✅ API response format:');
      console.log(JSON.stringify({
        success: true,
        plans: result.rows
      }, null, 2));
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testLoadPlans();
