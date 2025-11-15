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
}

module.exports = new TeacherController();
