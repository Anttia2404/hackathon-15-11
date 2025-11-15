const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function clearStudyPlans() {
  try {
    console.log('🗑️  Clearing all study plans...\n');

    // Delete all tasks first
    const tasksResult = await pool.query('DELETE FROM study_plan_tasks');
    console.log(`✅ Deleted ${tasksResult.rowCount} task(s)`);

    // Delete all plans
    const plansResult = await pool.query('DELETE FROM study_plans');
    console.log(`✅ Deleted ${plansResult.rowCount} plan(s)`);

    console.log('\n✨ All study plans cleared!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

clearStudyPlans();
