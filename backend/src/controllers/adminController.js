const { Class, Course, Teacher, Student, User, sequelize } = require('../models');
const { Op } = require('sequelize');

class AdminController {
  // Get admin dashboard statistics
  async getDashboard(req, res) {
    try {
      const stats = await sequelize.query(`
        SELECT 
          (SELECT COUNT(*) FROM classes) as total_classes,
          (SELECT COUNT(*) FROM teachers) as total_teachers,
          (SELECT COUNT(*) FROM students) as total_students,
          (SELECT COUNT(*) FROM courses) as total_courses,
          (SELECT COUNT(*) FROM class_enrollments WHERE status = 'active') as total_enrollments
      `, { type: sequelize.QueryTypes.SELECT });

      res.json({ statistics: stats[0] });
    } catch (error) {
      console.error('Get admin dashboard error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Get all classes with details
  async getAllClasses(req, res) {
    try {
      const classes = await Class.findAll({
        include: [
          {
            model: Course,
            attributes: ['course_name', 'course_code', 'credits'],
          },
          {
            model: Teacher,
            include: [{ model: User, as: 'User', attributes: ['full_name', 'email'] }],
          },
        ],
        order: [['created_at', 'DESC']],
      });

      // Get enrollment count for each class and convert to JSON
      const classesWithCount = await Promise.all(
        classes.map(async (cls) => {
          const enrollmentCount = await sequelize.query(
            `SELECT COUNT(*) as count FROM class_enrollments WHERE class_id = :classId AND status = 'active'`,
            {
              replacements: { classId: cls.class_id },
              type: sequelize.QueryTypes.SELECT,
            }
          );

          const classJson = cls.toJSON();
          return {
            ...classJson,
            enrollment_count: parseInt(enrollmentCount[0].count),
          };
        })
      );

      console.log('Classes with teacher data:', JSON.stringify(classesWithCount.slice(0, 1), null, 2));

      res.json({ classes: classesWithCount });
    } catch (error) {
      console.error('Get all classes error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Create new class
  async createClass(req, res) {
    try {
      const { course_id, teacher_id, class_code, semester, year, room, max_students } = req.body;

      // Check if class_code already exists
      const existing = await Class.findOne({ where: { class_code } });
      if (existing) {
        return res.status(400).json({ message: 'Mã lớp đã tồn tại' });
      }

      const newClass = await Class.create({
        course_id,
        teacher_id,
        class_code,
        semester,
        year,
        room,
        max_students: max_students || 50,
      });

      res.status(201).json({
        message: 'Tạo lớp học thành công',
        class: newClass,
      });
    } catch (error) {
      console.error('Create class error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Update class
  async updateClass(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const cls = await Class.findByPk(id);
      if (!cls) {
        return res.status(404).json({ message: 'Không tìm thấy lớp học' });
      }

      await cls.update(updates);

      res.json({
        message: 'Cập nhật lớp học thành công',
        class: cls,
      });
    } catch (error) {
      console.error('Update class error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Delete class
  async deleteClass(req, res) {
    try {
      const { id } = req.params;

      const cls = await Class.findByPk(id);
      if (!cls) {
        return res.status(404).json({ message: 'Không tìm thấy lớp học' });
      }

      await cls.destroy();

      res.json({ message: 'Xóa lớp học thành công' });
    } catch (error) {
      console.error('Delete class error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Get all teachers
  async getAllTeachers(req, res) {
    try {
      const teachers = await Teacher.findAll({
        include: [
          {
            model: User,
            as: 'User',
            attributes: ['full_name', 'email', 'is_active'],
          },
        ],
        order: [[{ model: User, as: 'User' }, 'full_name', 'ASC']],
      });

      // Convert to plain JSON to ensure User data is included
      const teachersData = teachers.map(teacher => teacher.toJSON());
      
      console.log('Teachers with User data:', JSON.stringify(teachersData, null, 2));

      res.json({ teachers: teachersData });
    } catch (error) {
      console.error('Get all teachers error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Get all students
  async getAllStudents(req, res) {
    try {
      const students = await Student.findAll({
        include: [
          {
            model: User,
            as: 'User',
            attributes: ['full_name', 'email', 'is_active'],
          },
        ],
        order: [[{ model: User, as: 'User' }, 'full_name', 'ASC']],
      });

      // Convert to plain JSON to ensure User data is included
      const studentsData = students.map(student => student.toJSON());

      res.json({ students: studentsData });
    } catch (error) {
      console.error('Get all students error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Add students to class
  async addStudentsToClass(req, res) {
    try {
      const { class_id, student_ids } = req.body;

      // Check if class exists
      const cls = await Class.findByPk(class_id);
      if (!cls) {
        return res.status(404).json({ message: 'Không tìm thấy lớp học' });
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

  // Get class enrollments
  async getClassEnrollments(req, res) {
    try {
      const { id } = req.params;

      const enrollments = await sequelize.query(`
        SELECT 
          ce.enrollment_id,
          ce.status,
          ce.enrolled_at,
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

  // Remove student from class
  async removeStudentFromClass(req, res) {
    try {
      const { enrollment_id } = req.params;

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

  // Get all courses
  async getAllCourses(req, res) {
    try {
      const courses = await Course.findAll({
        order: [['course_name', 'ASC']],
      });

      res.json({ courses });
    } catch (error) {
      console.error('Get all courses error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
}

module.exports = new AdminController();
