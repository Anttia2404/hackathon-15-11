const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// GET /api/v1/deadlines/:studentId - Load deadlines
router.get('/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    const result = await pool.query(`
      SELECT 
        deadline_id as id,
        title,
        description as details,
        due_date as "dueDate",
        estimated_hours as "estimatedHours",
        priority,
        status
      FROM deadlines
      WHERE student_id = $1 
        AND status != 'completed'
        AND due_date >= CURRENT_DATE
      ORDER BY due_date ASC
    `, [studentId]);

    res.json({
      success: true,
      deadlines: result.rows
    });
  } catch (error) {
    console.error('Error loading deadlines:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load deadlines',
      message: error.message
    });
  }
});

// POST /api/v1/deadlines/save - Save deadline
router.post('/save', async (req, res) => {
  try {
    const { studentId, deadline } = req.body;

    if (!studentId || !deadline) {
      return res.status(400).json({
        success: false,
        error: 'studentId and deadline are required'
      });
    }

    const result = await pool.query(`
      INSERT INTO deadlines 
      (student_id, title, description, due_date, estimated_hours, priority, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING deadline_id as id, title, description as details, 
                due_date as "dueDate", estimated_hours as "estimatedHours"
    `, [
      studentId,
      deadline.title,
      deadline.details || '',
      deadline.dueDate,
      deadline.estimatedHours || 0,
      deadline.priority || 'medium',
      'pending'
    ]);

    res.json({
      success: true,
      deadline: result.rows[0]
    });
  } catch (error) {
    console.error('Error saving deadline:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save deadline',
      message: error.message
    });
  }
});

// DELETE /api/v1/deadlines/:deadlineId - Delete deadline
router.delete('/:deadlineId', async (req, res) => {
  try {
    const { deadlineId } = req.params;

    await pool.query('DELETE FROM deadlines WHERE deadline_id = $1', [deadlineId]);

    res.json({
      success: true,
      message: 'Deadline deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting deadline:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete deadline',
      message: error.message
    });
  }
});

// PUT /api/v1/deadlines/:deadlineId - Update deadline
router.put('/:deadlineId', async (req, res) => {
  try {
    const { deadlineId } = req.params;
    const { title, details, dueDate, estimatedHours, status } = req.body;

    const result = await pool.query(`
      UPDATE deadlines 
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          due_date = COALESCE($3, due_date),
          estimated_hours = COALESCE($4, estimated_hours),
          status = COALESCE($5, status),
          completed_at = CASE WHEN $5 = 'completed' THEN CURRENT_TIMESTAMP ELSE completed_at END
      WHERE deadline_id = $6
      RETURNING deadline_id as id, title, description as details, 
                due_date as "dueDate", estimated_hours as "estimatedHours", status
    `, [title, details, dueDate, estimatedHours, status, deadlineId]);

    res.json({
      success: true,
      deadline: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating deadline:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update deadline',
      message: error.message
    });
  }
});

module.exports = router;
