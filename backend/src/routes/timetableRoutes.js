const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// GET /api/v1/timetable/:studentId - Load timetable (lịch học chính thức)
router.get('/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    // Load all timetable slots from enrolled classes
    const result = await pool.query(`
      SELECT 
        ts.slot_id,
        ts.day_of_week as day,
        TO_CHAR(ts.start_time, 'HH24:MI') as "startTime",
        TO_CHAR(ts.end_time, 'HH24:MI') as "endTime",
        CASE 
          WHEN co.course_code = 'IMPORTED' THEN ts.room
          ELSE co.course_code || ' - ' || co.course_name
        END as title,
        ts.room as location,
        CASE 
          WHEN co.course_code = 'IMPORTED' THEN true
          ELSE false
        END as "isImported"
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

    res.json({
      success: true,
      timetable: result.rows
    });
  } catch (error) {
    console.error('Error loading timetable:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load timetable',
      message: error.message
    });
  }
});

// POST /api/v1/timetable/save - Save imported timetable (lịch học chính thức)
router.post('/save', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { studentId, slots } = req.body;

    if (!studentId || !Array.isArray(slots)) {
      return res.status(400).json({
        success: false,
        error: 'studentId and slots array are required'
      });
    }

    await client.query('BEGIN');

    // Create or get "Imported Timetable" course
    let courseResult = await client.query(`
      SELECT course_id FROM courses WHERE course_code = 'IMPORTED'
    `);

    let courseId;
    if (courseResult.rows.length === 0) {
      const newCourse = await client.query(`
        INSERT INTO courses (course_code, course_name, description)
        VALUES ('IMPORTED', 'Imported Timetable', 'Timetable imported from external source')
        RETURNING course_id
      `);
      courseId = newCourse.rows[0].course_id;
    } else {
      courseId = courseResult.rows[0].course_id;
    }

    // Create or get "Imported Class" for this student
    let classResult = await client.query(`
      SELECT c.class_id FROM classes c
      WHERE c.course_id = $1 AND c.class_code = $2
    `, [courseId, `IMPORTED-${studentId.substring(0, 8)}`]);

    let classId;
    if (classResult.rows.length === 0) {
      // Get a dummy teacher (or create one)
      let teacherResult = await client.query(`
        SELECT teacher_id FROM teachers LIMIT 1
      `);
      
      let teacherId;
      if (teacherResult.rows.length === 0) {
        // Create dummy teacher
        const userResult = await client.query(`
          INSERT INTO users (email, password_hash, full_name, user_type)
          VALUES ('system@imported.com', 'dummy', 'System', 'teacher')
          RETURNING user_id
        `);
        const teacherInsert = await client.query(`
          INSERT INTO teachers (user_id, teacher_code, department)
          VALUES ($1, 'SYSTEM', 'Imported')
          RETURNING teacher_id
        `, [userResult.rows[0].user_id]);
        teacherId = teacherInsert.rows[0].teacher_id;
      } else {
        teacherId = teacherResult.rows[0].teacher_id;
      }

      // Create class
      const newClass = await client.query(`
        INSERT INTO classes (course_id, teacher_id, class_code, semester, year)
        VALUES ($1, $2, $3, 'Imported', 2025)
        RETURNING class_id
      `, [courseId, teacherId, `IMPORTED-${studentId.substring(0, 8)}`]);
      classId = newClass.rows[0].class_id;

      // Enroll student
      await client.query(`
        INSERT INTO class_enrollments (class_id, student_id, status)
        VALUES ($1, $2, 'active')
        ON CONFLICT (class_id, student_id) DO NOTHING
      `, [classId, studentId]);
    } else {
      classId = classResult.rows[0].class_id;
    }

    // Delete existing timetable slots for this class
    await client.query(
      'DELETE FROM timetable_slots WHERE class_id = $1',
      [classId]
    );

    // Insert new timetable slots
    for (const slot of slots) {
      await client.query(`
        INSERT INTO timetable_slots 
        (class_id, day_of_week, start_time, end_time, room)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        classId,
        slot.day,
        slot.startTime,
        slot.endTime,
        slot.location || slot.title || 'Imported'
      ]);
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Timetable saved successfully to timetable_slots'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error saving timetable:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save timetable',
      message: error.message
    });
  } finally {
    client.release();
  }
});

module.exports = router;
