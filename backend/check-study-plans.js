require('dotenv').config();
const pool = require('./src/db/pool');

async function checkStudyPlans() {
  try {
    console.log('🔍 Checking study plans in database...\n');

    const studentId = '00000000-0000-0000-0000-000000000001';

    // Check study_plans table
    const plansResult = await pool.query(`
      SELECT 
        plan_id,
        plan_date,
        study_mode,
        LEFT(ai_summary, 50) as summary_preview,
        created_at
      FROM study_plans
      WHERE student_id = $1
      ORDER BY plan_date
    `, [studentId]);

    console.log(`📅 Found ${plansResult.rows.length} study plan(s):\n`);
    
    if (plansResult.rows.length === 0) {
      console.log('   ❌ No study plans found in database!');
      console.log('   This means the save operation is not working.\n');
    } else {
      plansResult.rows.forEach((plan, idx) => {
        console.log(`${idx + 1}. Plan ID: ${plan.plan_id}`);
        console.log(`   Date: ${plan.plan_date}`);
        console.log(`   Mode: ${plan.study_mode}`);
        console.log(`   Summary: ${plan.summary_preview}...`);
        console.log(`   Created: ${plan.created_at}`);
        console.log('');
      });
    }

    // Check study_plan_tasks table
    const tasksResult = await pool.query(`
      SELECT 
        sp.plan_date,
        COUNT(spt.task_id) as task_count,
        json_agg(
          json_build_object(
            'taskName', spt.task_name,
            'startTime', TO_CHAR(spt.start_time, 'HH24:MI'),
            'endTime', TO_CHAR(spt.end_time, 'HH24:MI'),
            'category', spt.category
          ) ORDER BY spt.start_time
        ) as tasks
      FROM study_plans sp
      LEFT JOIN study_plan_tasks spt ON sp.plan_id = spt.plan_id
      WHERE sp.student_id = $1
      GROUP BY sp.plan_date, sp.plan_id
      ORDER BY sp.plan_date
    `, [studentId]);

    console.log(`📝 Task details:\n`);
    
    if (tasksResult.rows.length === 0) {
      console.log('   ❌ No tasks found!');
    } else {
      tasksResult.rows.forEach((day) => {
        console.log(`📅 ${day.plan_date} (${day.task_count} tasks):`);
        if (day.tasks && day.tasks[0].taskName) {
          day.tasks.forEach((task, idx) => {
            console.log(`   ${idx + 1}. ${task.startTime}-${task.endTime}: ${task.taskName} [${task.category}]`);
          });
        } else {
          console.log('   (No tasks)');
        }
        console.log('');
      });
    }

    console.log('✅ Check complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking study plans:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

checkStudyPlans();
