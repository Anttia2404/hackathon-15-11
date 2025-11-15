const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Student = require('./Student');

const StudyPlan = sequelize.define(
  'study_plan',
  {
    plan_id: {
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
    plan_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    study_mode: {
      type: DataTypes.ENUM('relaxed', 'normal', 'sprint'),
      defaultValue: 'normal',
    },
    ai_summary: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: 'study_plans',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

// Associations
StudyPlan.belongsTo(Student, { foreignKey: 'student_id', onDelete: 'CASCADE' });
Student.hasMany(StudyPlan, { foreignKey: 'student_id' });

module.exports = StudyPlan;
