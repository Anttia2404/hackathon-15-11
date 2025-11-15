const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// GET /api/v1/timetable/:studentId - Load timetable (lịch học chính thức)
router.get('/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    // Load all timetable slots from enrolled classes
    const result = await pool.query(
      `
      SELECT 
        ts.slot_id,
        ts.day_of_week as day,
        TO_CHAR(ts.start_time, 'HH24:MI') as "startTime",
        TO_CHAR(ts.end_time, 'HH24:MI') as "endTime",
        co.course_name as title,
        ts.room as location,
        CASE 
          WHEN co.course_code LIKE 'IMP-%' THEN true
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
    `,
      [studentId]
    );

    res.json({
      success: true,
      timetable: result.rows,
    });
  } catch (error) {
    console.error('Error loading timetable:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load timetable',
      message: error.message,
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
        error: 'studentId and slots array are required',
      });
    }

    await client.query('BEGIN');

    // Delete ALL existing imported classes and their slots for this student
    // Find all classes where student is enrolled AND class_code starts with IMPORTED or course_code starts with IMP-
    const existingClassesResult = await client.query(
      `
      SELECT DISTINCT c.class_id, co.course_id
      FROM classes c
      JOIN courses co ON c.course_id = co.course_id
      JOIN class_enrollments ce ON c.class_id = ce.class_id
      WHERE ce.student_id = $1 
        AND (c.class_code LIKE 'IMPORTED-%' OR c.class_code LIKE 'IMP-%')
    `,
      [studentId]
    );

    console.log(
      `🗑️ Deleting ${existingClassesResult.rows.length} existing imported classes for student ${studentId}`
    );

    // Delete all timetable slots, enrollments, classes, and courses
    for (const row of existingClassesResult.rows) {
      await client.query('DELETE FROM timetable_slots WHERE class_id = $1', [row.class_id]);
      await client.query('DELETE FROM class_enrollments WHERE class_id = $1', [row.class_id]);
      await client.query('DELETE FROM classes WHERE class_id = $1', [row.class_id]);
      await client.query('DELETE FROM courses WHERE course_id = $1', [row.course_id]);
    }

    // If slots array is empty, just delete and return (user wants to clear timetable)
    if (slots.length === 0) {
      await client.query('COMMIT');
      console.log('✅ Timetable cleared successfully for student', studentId);
      return res.json({
        success: true,
        message: 'Timetable cleared successfully',
      });
    }

    // Get or create system teacher
    let teacherResult = await client.query(`
      SELECT teacher_id FROM teachers 
      JOIN users ON teachers.user_id = users.user_id
      WHERE users.email = 'system@imported.com'
    `);

    let teacherId;
    if (teacherResult.rows.length === 0) {
      const userResult = await client.query(`
        INSERT INTO users (email, password_hash, full_name, user_type)
        VALUES ('system@imported.com', 'dummy', 'System', 'teacher')
        RETURNING user_id
      `);
      const teacherInsert = await client.query(
        `
        INSERT INTO teachers (user_id, teacher_code, department)
        VALUES ($1, 'SYSTEM', 'Imported')
        RETURNING teacher_id
      `,
        [userResult.rows[0].user_id]
      );
      teacherId = teacherInsert.rows[0].teacher_id;
    } else {
      teacherId = teacherResult.rows[0].teacher_id;
    }

    // Group slots by title (subject name) to create separate courses
    const slotsBySubject = {};
    for (const slot of slots) {
      const subjectName = slot.title || 'Imported Subject';
      if (!slotsBySubject[subjectName]) {
        slotsBySubject[subjectName] = [];
      }
      slotsBySubject[subjectName].push(slot);
    }

    // Create a course and class for each unique subject
    for (const [subjectName, subjectSlots] of Object.entries(slotsBySubject)) {
      // Create unique course for this subject
      const courseCode = `IMP-${subjectName
        .substring(0, 10)
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')}-${Date.now().toString().slice(-4)}`;

      const courseResult = await client.query(
        `
        INSERT INTO courses (course_code, course_name, description)
        VALUES ($1, $2, 'Imported from Smart Schedule')
        RETURNING course_id
      `,
        [courseCode, subjectName]
      );

      const courseId = courseResult.rows[0].course_id;

      // Create class for this course
      const classResult = await client.query(
        `
        INSERT INTO classes (course_id, teacher_id, class_code, semester, year)
        VALUES ($1, $2, $3, 'Imported', 2025)
        RETURNING class_id
      `,
        [courseId, teacherId, courseCode]
      );

      const classId = classResult.rows[0].class_id;

      // Enroll student in this class
      await client.query(
        `
        INSERT INTO class_enrollments (class_id, student_id, status)
        VALUES ($1, $2, 'active')
      `,
        [classId, studentId]
      );

      // Insert timetable slots for this subject
      for (const slot of subjectSlots) {
        await client.query(
          `
          INSERT INTO timetable_slots 
          (class_id, day_of_week, start_time, end_time, room)
          VALUES ($1, $2, $3, $4, $5)
        `,
          [classId, slot.day, slot.startTime, slot.endTime, slot.location || 'TBA']
        );
      }
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Timetable saved successfully with subject names',
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error saving timetable:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save timetable',
      message: error.message,
    });
  } finally {
    client.release();
  }
});

module.exports = router;
