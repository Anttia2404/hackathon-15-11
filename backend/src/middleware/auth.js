const jwt = require('jsonwebtoken');
const { User, Student, Teacher } = require('../models');

// Authenticate user
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.user_id, {
      attributes: { exclude: ['password_hash'] },
    });

    if (!user || !user.is_active) {
      return res.status(401).json({ message: 'Invalid token or inactive user' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Require student role
const requireStudent = async (req, res, next) => {
  try {
    if (req.user.user_type !== 'student') {
      return res.status(403).json({ message: 'Access denied. Students only.' });
    }

    const student = await Student.findOne({ where: { user_id: req.user.user_id } });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    req.student = student;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Require teacher role
const requireTeacher = async (req, res, next) => {
  try {
    if (req.user.user_type !== 'teacher') {
      return res.status(403).json({ message: 'Access denied. Teachers only.' });
    }

    const teacher = await Teacher.findOne({ where: { user_id: req.user.user_id } });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }

    req.teacher = teacher;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Require admin role
const requireAdmin = (req, res, next) => {
  if (req.user.user_type !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};

module.exports = {
  authenticate,
  requireStudent,
  requireTeacher,
  requireAdmin,
};
