const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Teacher = require('./Teacher');

const Quiz = sequelize.define(
  'quiz',
  {
    quiz_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    class_id: {
      type: DataTypes.UUID,
      references: {
        model: 'classes',
        key: 'class_id',
      },
    },
    teacher_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'teachers',
        key: 'teacher_id',
      },
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    topic: {
      type: DataTypes.STRING(255),
    },
    difficulty: {
      type: DataTypes.ENUM('easy', 'medium', 'hard', 'mixed'),
      defaultValue: 'medium',
    },
    total_questions: {
      type: DataTypes.INTEGER,
    },
    time_limit_minutes: {
      type: DataTypes.INTEGER,
    },
    is_ai_generated: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: 'quizzes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

// Associations
Quiz.belongsTo(Teacher, { foreignKey: 'teacher_id', onDelete: 'CASCADE' });
Teacher.hasMany(Quiz, { foreignKey: 'teacher_id' });

module.exports = Quiz;
