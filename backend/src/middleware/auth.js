const jwt = require('jsonwebtoken');
const { User, Student, Teacher } = require('../models');

// Authenticate user
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log(
      '🔐 authenticate middleware - Authorization header:',
      authHeader ? 'Present' : 'Missing'
    );

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No token provided');
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.substring(7);
    console.log('🔍 Token (first 20 chars):', token.substring(0, 20) + '...');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decoded:', { user_id: decoded.user_id, user_type: decoded.user_type });

    const user = await User.findByPk(decoded.user_id, {
      attributes: { exclude: ['password_hash'] },
    });

    if (!user || !user.is_active) {
      console.log('❌ Invalid token or inactive user');
      return res.status(401).json({ message: 'Invalid token or inactive user' });
    }

    console.log('✅ User authenticated:', {
      user_id: user.user_id,
      user_type: user.user_type,
      email: user.email,
    });
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ authenticate error:', error.message);
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
    console.log('🔍 requireTeacher middleware - user:', req.user);

    if (req.user.user_type !== 'teacher') {
      console.log('❌ User is not a teacher:', req.user.user_type);
      return res.status(403).json({ message: 'Access denied. Teachers only.' });
    }

    const teacher = await Teacher.findOne({ where: { user_id: req.user.user_id } });
    console.log('🔍 Teacher record:', teacher?.dataValues);

    if (!teacher) {
      console.log('❌ Teacher profile not found for user_id:', req.user.user_id);
      return res.status(404).json({ message: 'Teacher profile not found' });
    }

    req.teacher = teacher;
    console.log('✅ Teacher authenticated:', teacher.teacher_id);
    next();
  } catch (error) {
    console.error('❌ requireTeacher error:', error);
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
