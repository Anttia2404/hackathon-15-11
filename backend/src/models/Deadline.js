const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Student = require('./Student');

const Deadline = sequelize.define(
  'deadline',
  {
    deadline_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    student_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'students',
        key: 'student_id',
      },
    },
    class_id: {
      type: DataTypes.UUID,
      references: {
        model: 'classes',
        key: 'class_id',
      },
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    estimated_hours: {
      type: DataTypes.DECIMAL(5, 2),
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium',
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'overdue'),
      defaultValue: 'pending',
    },
    completed_at: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: 'deadlines',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

// Associations
Deadline.belongsTo(Student, { foreignKey: 'student_id', onDelete: 'CASCADE' });
Student.hasMany(Deadline, { foreignKey: 'student_id' });

module.exports = Deadline;
