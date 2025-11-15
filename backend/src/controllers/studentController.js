const { Student, Deadline, StudyPlan, Class, Course } = require('../models');
const { sequelize } = require('../config/database');

class StudentController {
  // Get student dashboard
  async getDashboard(req, res) {
    try {
      const studentId = req.student.student_id;

      // Get student info
      const student = await Student.findByPk(studentId, {
        include: [
          {
            model: require('../models/User'),
            as: 'User',
            attributes: ['full_name', 'email'],
          },
        ],
      });

      // Get pending deadlines
      const deadlines = await Deadline.findAll({
        where: { student_id: studentId, status: 'pending' },
        order: [['due_date', 'ASC']],
        limit: 5,
      });

      // Get study health score (mock for now)
      const healthScore = {
        overall_score: 78,
        attendance_score: 92,
        assignment_completion_score: 85,
        performance_score: 76,
      };

      // Get enrolled classes count
      const classCount = await sequelize.query(
        `SELECT COUNT(*) as total FROM class_enrollments WHERE student_id = :studentId AND status = 'active'`,
        {
          replacements: { studentId },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      res.json({
        student: {
          ...student.toJSON(),
          total_classes: classCount[0].total,
        },
        pending_deadlines: deadlines.length,
        deadlines,
        health_score: healthScore,
      });
    } catch (error) {
      console.error('Get dashboard error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Get student deadlines
  async getDeadlines(req, res) {
    try {
      const studentId = req.student.student_id;
      const { status } = req.query;

      const where = { student_id: studentId };
      if (status) {
        where.status = status;
      }

      const deadlines = await Deadline.findAll({
        where,
        order: [['due_date', 'ASC']],
        include: [
          {
            model: Class,
            include: [{ model: Course }],
            required: false,
          },
        ],
      });

      res.json({ deadlines });
    } catch (error) {
      console.error('Get deadlines error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Create new deadline
  async createDeadline(req, res) {
    try {
      const studentId = req.student.student_id;
      const { title, description, due_date, estimated_hours, priority, class_id } = req.body;

      const deadline = await Deadline.create({
        student_id: studentId,
        class_id,
        title,
        description,
        due_date,
        estimated_hours,
        priority,
      });

      res.status(201).json({
        message: 'Deadline created successfully',
        deadline,
      });
    } catch (error) {
      console.error('Create deadline error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Update deadline
  async updateDeadline(req, res) {
    try {
      const { id } = req.params;
      const studentId = req.student.student_id;
      const updates = req.body;

      const deadline = await Deadline.findOne({
        where: { deadline_id: id, student_id: studentId },
      });

      if (!deadline) {
        return res.status(404).json({ message: 'Deadline not found' });
      }

      await deadline.update(updates);

      res.json({
        message: 'Deadline updated successfully',
        deadline,
      });
    } catch (error) {
      console.error('Update deadline error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Get study plans
  async getStudyPlans(req, res) {
    try {
      const studentId = req.student.student_id;
      const { date } = req.query;

      const where = { student_id: studentId };
      if (date) {
        where.plan_date = date;
      }

      const plans = await StudyPlan.findAll({
        where,
        order: [['plan_date', 'DESC']],
        limit: 10,
      });

      res.json({ plans });
    } catch (error) {
      console.error('Get study plans error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
}

module.exports = new StudentController();
