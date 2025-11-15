const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkStudyPlans() {
  try {
    console.log('🔍 Checking study plans in database...\n');

    // Get all study plans with tasks
    const result = await pool.query(`
      SELECT 
        sp.plan_id,
        sp.plan_date,
        sp.study_mode,
        sp.ai_summary,
        json_agg(
          json_build_object(
            'task_id', spt.task_id,
            'task_name', spt.task_name,
            'start_time', TO_CHAR(spt.start_time, 'HH24:MI'),
            'end_time', TO_CHAR(spt.end_time, 'HH24:MI'),
            'duration', spt.duration_minutes,
            'category', spt.category
          ) ORDER BY spt.start_time
        ) as tasks
      FROM study_plans sp
      LEFT JOIN study_plan_tasks spt ON sp.plan_id = spt.plan_id
      GROUP BY sp.plan_id, sp.plan_date, sp.study_mode, sp.ai_summary
      ORDER BY sp.plan_date
    `);

    if (result.rows.length === 0) {
      console.log('❌ No study plans found');
      return;
    }

    console.log(`✅ Found ${result.rows.length} study plan(s)\n`);

    result.rows.forEach((plan, index) => {
      console.log(`\n📅 Plan ${index + 1}: ${plan.plan_date}`);
      console.log(`   Mode: ${plan.study_mode}`);
      console.log(`   Tasks: ${plan.tasks.filter(t => t.task_id).length}`);
      
      if (plan.tasks && plan.tasks.length > 0) {
        plan.tasks.filter(t => t.task_id).forEach((task, i) => {
          console.log(`   ${i + 1}. ${task.start_time} - ${task.end_time} | ${task.task_name} (${task.category})`);
        });
      }
    });

    // Check for duplicates
    console.log('\n\n🔍 Checking for duplicate dates...');
    const dateCount = {};
    result.rows.forEach(plan => {
      dateCount[plan.plan_date] = (dateCount[plan.plan_date] || 0) + 1;
    });

    const duplicates = Object.entries(dateCount).filter(([_, count]) => count > 1);
    if (duplicates.length > 0) {
      console.log('⚠️  Found duplicate dates:');
      duplicates.forEach(([date, count]) => {
        console.log(`   ${date}: ${count} entries`);
      });
    } else {
      console.log('✅ No duplicate dates found');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkStudyPlans();
