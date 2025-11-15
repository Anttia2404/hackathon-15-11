const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Student, Teacher } = require('../models');

class AuthController {
  // Register new user
  async register(req, res) {
    try {
      const {
        email,
        password,
        full_name,
        user_type,
        student_code,
        teacher_code,
        major,
        department,
      } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Hash password
      const password_hash = await bcrypt.hash(password, 10);

      // Create user
      const user = await User.create({
        email,
        password_hash,
        full_name,
        user_type,
      });

      // Create role-specific record
      if (user_type === 'student') {
        await Student.create({
          user_id: user.user_id,
          student_code: student_code || `SV${Date.now()}`,
          major,
        });
      } else if (user_type === 'teacher') {
        await Teacher.create({
          user_id: user.user_id,
          teacher_code: teacher_code || `TC${Date.now()}`,
          department,
        });
      }

      // Generate token
      const token = jwt.sign(
        { user_id: user.user_id, user_type: user.user_type },
        process.env.JWT_SECRET || 'default-secret-key',
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          user_id: user.user_id,
          email: user.email,
          full_name: user.full_name,
          user_type: user.user_type,
        },
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Update last login
      await user.update({ last_login: new Date() });

      // Generate token
      const token = jwt.sign(
        { user_id: user.user_id, user_type: user.user_type },
        process.env.JWT_SECRET || 'default-secret-key',
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          user_id: user.user_id,
          email: user.email,
          full_name: user.full_name,
          user_type: user.user_type,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Get current user
  async getCurrentUser(req, res) {
    try {
      const user = await User.findByPk(req.user.user_id, {
        attributes: { exclude: ['password_hash'] },
        include: [
          { model: Student, required: false },
          { model: Teacher, required: false },
        ],
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ user });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Logout (client-side token removal, optional server-side blacklist)
  async logout(req, res) {
    res.json({ message: 'Logout successful' });
  }
}

module.exports = new AuthController();
