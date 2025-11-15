const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// GET /api/v1/study-plans/:studentId - Load study plans
router.get('/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;

    let query = `
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
    `;

    const params = [studentId];

    if (startDate && endDate) {
      query += ` AND sp.plan_date BETWEEN $2 AND $3`;
      params.push(startDate, endDate);
    }

    query += ` GROUP BY sp.plan_id, sp.plan_date, sp.study_mode, sp.ai_summary ORDER BY sp.plan_date`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      plans: result.rows
    });
  } catch (error) {
    console.error('Error loading study plans:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load study plans',
      message: error.message
    });
  }
});

// POST /api/v1/study-plans/save - Save study plan
router.post('/save', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { studentId, plan } = req.body;

    if (!studentId || !plan) {
      return res.status(400).json({
        success: false,
        error: 'studentId and plan are required'
      });
    }

    await client.query('BEGIN');

    // Check if plan exists for this date
    const existingPlan = await client.query(
      'SELECT plan_id FROM study_plans WHERE student_id = $1 AND plan_date = $2',
      [studentId, plan.planDate]
    );

    let planId;

    if (existingPlan.rows.length > 0) {
      // Update existing plan
      planId = existingPlan.rows[0].plan_id;
      
      await client.query(`
        UPDATE study_plans 
        SET study_mode = $1, ai_summary = $2
        WHERE plan_id = $3
      `, [plan.studyMode, plan.summary, planId]);

      // Delete old tasks
      await client.query('DELETE FROM study_plan_tasks WHERE plan_id = $1', [planId]);
    } else {
      // Create new plan
      const newPlan = await client.query(`
        INSERT INTO study_plans (student_id, plan_date, study_mode, ai_summary)
        VALUES ($1, $2, $3, $4)
        RETURNING plan_id
      `, [studentId, plan.planDate, plan.studyMode, plan.summary]);

      planId = newPlan.rows[0].plan_id;
    }

    // Insert tasks
    if (plan.tasks && Array.isArray(plan.tasks)) {
      for (const task of plan.tasks) {
        await client.query(`
          INSERT INTO study_plan_tasks 
          (plan_id, task_name, start_time, end_time, duration_minutes, category)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          planId,
          task.taskName || task.task,
          task.startTime,
          task.endTime,
          task.duration || 60,
          task.category || 'study'
        ]);
      }
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Study plan saved successfully',
      planId
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error saving study plan:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save study plan',
      message: error.message
    });
  } finally {
    client.release();
  }
});

// PUT /api/v1/study-plans/task/:taskId/complete - Mark task as completed
router.put('/task/:taskId/complete', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { isCompleted } = req.body;

    await pool.query(`
      UPDATE study_plan_tasks 
      SET is_completed = $1,
          completed_at = CASE WHEN $1 = true THEN CURRENT_TIMESTAMP ELSE NULL END
      WHERE task_id = $2
    `, [isCompleted, taskId]);

    res.json({
      success: true,
      message: 'Task updated successfully'
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update task',
      message: error.message
    });
  }
});

// DELETE /api/v1/study-plans/:studentId/all - Delete all study plans
router.delete('/:studentId/all', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { studentId } = req.params;

    await client.query('BEGIN');

    // Delete all tasks first
    await client.query(`
      DELETE FROM study_plan_tasks 
      WHERE plan_id IN (
        SELECT plan_id FROM study_plans WHERE student_id = $1
      )
    `, [studentId]);

    // Delete all plans
    const result = await client.query(
      'DELETE FROM study_plans WHERE student_id = $1',
      [studentId]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: `Deleted ${result.rowCount} study plan(s)`
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting all study plans:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete study plans',
      message: error.message
    });
  } finally {
    client.release();
  }
});

// DELETE /api/v1/study-plans/:studentId/:planDate - Delete specific study plan
router.delete('/:studentId/:planDate', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { studentId, planDate } = req.params;

    await client.query('BEGIN');

    // Get plan ID
    const planResult = await client.query(
      'SELECT plan_id FROM study_plans WHERE student_id = $1 AND plan_date = $2',
      [studentId, planDate]
    );

    if (planResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.json({
        success: true,
        message: 'Plan not found (already deleted)'
      });
    }

    const planId = planResult.rows[0].plan_id;

    // Delete tasks first (foreign key constraint)
    await client.query('DELETE FROM study_plan_tasks WHERE plan_id = $1', [planId]);

    // Delete plan
    await client.query('DELETE FROM study_plans WHERE plan_id = $1', [planId]);

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Study plan deleted successfully'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting study plan:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete study plan',
      message: error.message
    });
  } finally {
    client.release();
  }
});

// DELETE /api/v1/study-plans/:studentId/all - Delete all study plans for student
router.delete('/:studentId/all', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { studentId } = req.params;

    await client.query('BEGIN');

    // Get all plan IDs
    const plansResult = await client.query(
      'SELECT plan_id FROM study_plans WHERE student_id = $1',
      [studentId]
    );

    if (plansResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.json({
        success: true,
        message: 'No plans to delete'
      });
    }

    const planIds = plansResult.rows.map(row => row.plan_id);

    // Delete all tasks
    await client.query(
      'DELETE FROM study_plan_tasks WHERE plan_id = ANY($1)',
      [planIds]
    );

    // Delete all plans
    await client.query('DELETE FROM study_plans WHERE student_id = $1', [studentId]);

    await client.query('COMMIT');

    res.json({
      success: true,
      message: `Deleted ${plansResult.rows.length} study plan(s) successfully`
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting all study plans:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete study plans',
      message: error.message
    });
  } finally {
    client.release();
  }
});

module.exports = router;
