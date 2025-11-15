const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// GET /api/v1/preferences/:studentId - Load preferences
router.get('/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    const result = await pool.query(`
      SELECT 
        sleep_hours as "sleepHours",
        lunch_duration_minutes as "lunchDuration",
        dinner_duration_minutes as "dinnerDuration",
        no_study_after_time as "noAfter23",
        no_study_on_sundays as "noSundays",
        preferred_study_mode as "studyMode"
      FROM student_preferences
      WHERE student_id = $1
    `, [studentId]);

    if (result.rows.length === 0) {
      // Return defaults if no preferences exist
      return res.json({
        success: true,
        preferences: {
          sleepHours: 7,
          lunchDuration: 45,
          dinnerDuration: 45,
          noAfter23: false,
          noSundays: false,
          studyMode: 'normal'
        }
      });
    }

    res.json({
      success: true,
      preferences: result.rows[0]
    });
  } catch (error) {
    console.error('Error loading preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load preferences',
      message: error.message
    });
  }
});

// POST /api/v1/preferences/save - Save preferences
router.post('/save', async (req, res) => {
  try {
    const { studentId, preferences } = req.body;

    if (!studentId || !preferences) {
      return res.status(400).json({
        success: false,
        error: 'studentId and preferences are required'
      });
    }

    const result = await pool.query(`
      INSERT INTO student_preferences 
      (student_id, sleep_hours, lunch_duration_minutes, dinner_duration_minutes, 
       no_study_after_time, no_study_on_sundays, preferred_study_mode)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (student_id) 
      DO UPDATE SET
        sleep_hours = EXCLUDED.sleep_hours,
        lunch_duration_minutes = EXCLUDED.lunch_duration_minutes,
        dinner_duration_minutes = EXCLUDED.dinner_duration_minutes,
        no_study_after_time = EXCLUDED.no_study_after_time,
        no_study_on_sundays = EXCLUDED.no_study_on_sundays,
        preferred_study_mode = EXCLUDED.preferred_study_mode,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [
      studentId,
      preferences.sleepHours || 7,
      preferences.lunchDuration || 45,
      preferences.dinnerDuration || 45,
      preferences.noAfter23 ? '23:00:00' : '24:00:00',
      preferences.noSundays || false,
      preferences.studyMode || 'normal'
    ]);

    res.json({
      success: true,
      message: 'Preferences saved successfully',
      preferences: result.rows[0]
    });
  } catch (error) {
    console.error('Error saving preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save preferences',
      message: error.message
    });
  }
});

module.exports = router;
