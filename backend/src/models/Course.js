const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Course = sequelize.define(
  'course',
  {
    course_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    course_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    course_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    credits: {
      type: DataTypes.INTEGER,
    },
  },
  {
    tableName: 'courses',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

module.exports = Course;
