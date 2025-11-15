const { Teacher, Class, Course } = require('../models');
const { sequelize } = require('../config/database');

class TeacherController {
  // Get teacher dashboard
  async getDashboard(req, res) {
    try {
      const teacherId = req.teacher.teacher_id;

      // Get teacher classes
      const classes = await Class.findAll({
        where: { teacher_id: teacherId },
        include: [
          {
            model: Course,
            attributes: ['course_name', 'course_code'],
          },
        ],
      });

      // Get class statistics
      const stats = await sequelize.query(
        `SELECT 
          COUNT(DISTINCT ce.student_id) as total_students,
          ROUND(AVG(CASE WHEN a.status = 'present' THEN 100 ELSE 0 END), 2) as avg_attendance,
          COUNT(DISTINCT CASE WHEN ars.risk_level IN ('high', 'critical') THEN ars.student_id END) as at_risk_count
        FROM classes c
        LEFT JOIN class_enrollments ce ON c.class_id = ce.class_id AND ce.status = 'active'
        LEFT JOIN attendance a ON c.class_id = a.class_id
        LEFT JOIN at_risk_students ars ON c.class_id = ars.class_id
        WHERE c.teacher_id = :teacherId
        GROUP BY c.teacher_id`,
        {
          replacements: { teacherId },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      res.json({
        classes,
        statistics: stats[0] || {
          total_students: 0,
          avg_attendance: 0,
          at_risk_count: 0,
        },
      });
    } catch (error) {
      console.error('Get teacher dashboard error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Get at-risk students
  async getAtRiskStudents(req, res) {
    try {
      const teacherId = req.teacher.teacher_id;
      const { class_id } = req.query;

      let query = `
        SELECT 
          ars.*,
          s.student_code,
          u.full_name,
          c.class_code
        FROM at_risk_students ars
        JOIN students s ON ars.student_id = s.student_id
        JOIN users u ON s.user_id = u.user_id
        JOIN classes c ON ars.class_id = c.class_id
        WHERE c.teacher_id = :teacherId
      `;

      const replacements = { teacherId };

      if (class_id) {
        query += ' AND ars.class_id = :classId';
        replacements.classId = class_id;
      }

      query += ' ORDER BY ars.risk_level DESC, ars.last_updated DESC';

      const atRiskStudents = await sequelize.query(query, {
        replacements,
        type: sequelize.QueryTypes.SELECT,
      });

      res.json({ at_risk_students: atRiskStudents });
    } catch (error) {
      console.error('Get at-risk students error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Mark attendance
  async markAttendance(req, res) {
    try {
      const { class_id, attendance_date, students } = req.body;
      const teacherId = req.teacher.teacher_id;

      // Verify class belongs to teacher
      const classExists = await Class.findOne({
        where: { class_id, teacher_id: teacherId },
      });

      if (!classExists) {
        return res.status(403).json({ message: 'Unauthorized to mark attendance for this class' });
      }

      // Insert attendance records
      const values = students
        .map(
          s =>
            `('${s.student_id}', '${class_id}', '${attendance_date}', '${s.status}', '${req.user.user_id}')`
        )
        .join(',');

      await sequelize.query(`
        INSERT INTO attendance (student_id, class_id, attendance_date, status, marked_by)
        VALUES ${values}
        ON CONFLICT (class_id, student_id, attendance_date) 
        DO UPDATE SET status = EXCLUDED.status, marked_by = EXCLUDED.marked_by
      `);

      res.json({ message: 'Attendance marked successfully' });
    } catch (error) {
      console.error('Mark attendance error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Get teacher's classes
  async getTeacherClasses(req, res) {
    try {
      const teacherId = req.teacher.teacher_id;

      const classes = await Class.findAll({
        where: { teacher_id: teacherId },
        include: [
          {
            model: Course,
            attributes: ['course_name', 'course_code', 'credits'],
          },
        ],
        order: [['created_at', 'DESC']],
      });

      // Get enrollment count for each class
      const classesWithCount = await Promise.all(
        classes.map(async (cls) => {
          const enrollmentCount = await sequelize.query(
            `SELECT COUNT(*) as count FROM class_enrollments WHERE class_id = :classId AND status = 'active'`,
            {
              replacements: { classId: cls.class_id },
              type: sequelize.QueryTypes.SELECT,
            }
          );

          return {
            ...cls.toJSON(),
            enrollment_count: enrollmentCount[0].count,
          };
        })
      );

      res.json({ classes: classesWithCount });
    } catch (error) {
      console.error('Get teacher classes error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Get class enrollments
  async getClassEnrollments(req, res) {
    try {
      const { id } = req.params;
      const teacherId = req.teacher.teacher_id;

      // Verify class belongs to teacher
      const classExists = await Class.findOne({
        where: { class_id: id, teacher_id: teacherId },
      });

      if (!classExists) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      const enrollments = await sequelize.query(`
        SELECT 
          ce.enrollment_id,
          ce.status,
          ce.enrolled_at,
          s.student_id,
          s.student_code,
          u.full_name,
          u.email
        FROM class_enrollments ce
        JOIN students s ON ce.student_id = s.student_id
        JOIN users u ON s.user_id = u.user_id
        WHERE ce.class_id = :classId
        ORDER BY u.full_name ASC
      `, {
        replacements: { classId: id },
        type: sequelize.QueryTypes.SELECT,
      });

      res.json({ enrollments });
    } catch (error) {
      console.error('Get class enrollments error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Add students to class
  async addStudentsToClass(req, res) {
    try {
      const { class_id, student_ids } = req.body;
      const teacherId = req.teacher.teacher_id;

      // Verify class belongs to teacher
      const classExists = await Class.findOne({
        where: { class_id, teacher_id: teacherId },
      });

      if (!classExists) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      // Add enrollments
      const enrollments = student_ids.map(student_id => ({
        class_id,
        student_id,
        status: 'active',
      }));

      await sequelize.query(`
        INSERT INTO class_enrollments (class_id, student_id, status, enrolled_at)
        VALUES ${enrollments.map(e => `('${e.class_id}', '${e.student_id}', '${e.status}', NOW())`).join(',')}
        ON CONFLICT (class_id, student_id) DO NOTHING
      `);

      res.json({
        message: `Đã thêm ${student_ids.length} sinh viên vào lớp`,
      });
    } catch (error) {
      console.error('Add students to class error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Remove student from class
  async removeStudentFromClass(req, res) {
    try {
      const { enrollment_id } = req.params;
      const teacherId = req.teacher.teacher_id;

      // Verify enrollment belongs to teacher's class
      const enrollment = await sequelize.query(`
        SELECT ce.* FROM class_enrollments ce
        JOIN classes c ON ce.class_id = c.class_id
        WHERE ce.enrollment_id = :enrollmentId AND c.teacher_id = :teacherId
      `, {
        replacements: { enrollmentId: enrollment_id, teacherId },
        type: sequelize.QueryTypes.SELECT,
      });

      if (enrollment.length === 0) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      await sequelize.query(`
        DELETE FROM class_enrollments WHERE enrollment_id = :enrollmentId
      `, {
        replacements: { enrollmentId: enrollment_id },
      });

      res.json({ message: 'Đã xóa sinh viên khỏi lớp' });
    } catch (error) {
      console.error('Remove student from class error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Get all students (for adding to class)
  async getAllStudents(req, res) {
    try {
      const students = await sequelize.query(`
        SELECT 
          s.student_id,
          s.student_code,
          s.major,
          u.full_name,
          u.email
        FROM students s
        JOIN users u ON s.user_id = u.user_id
        WHERE u.is_active = true
        ORDER BY u.full_name ASC
      `, {
        type: sequelize.QueryTypes.SELECT,
      });

      // Transform to match frontend expectations
      const transformedStudents = students.map(s => ({
        student_id: s.student_id,
        student_code: s.student_code,
        major: s.major,
        User: {
          full_name: s.full_name,
          email: s.email,
        },
      }));

      res.json({ students: transformedStudents });
    } catch (error) {
      console.error('Get all students error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
}

module.exports = new TeacherController();
