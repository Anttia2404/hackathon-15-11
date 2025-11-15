const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Course = require('./Course');
const Teacher = require('./Teacher');

const Class = sequelize.define(
  'class',
  {
    class_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    course_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'course_id',
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
    class_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    semester: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    room: {
      type: DataTypes.STRING(50),
    },
    max_students: {
      type: DataTypes.INTEGER,
      defaultValue: 50,
    },
  },
  {
    tableName: 'classes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

// Associations
Class.belongsTo(Course, { foreignKey: 'course_id', onDelete: 'CASCADE' });
Class.belongsTo(Teacher, { foreignKey: 'teacher_id', onDelete: 'CASCADE' });
Course.hasMany(Class, { foreignKey: 'course_id' });
Teacher.hasMany(Class, { foreignKey: 'teacher_id' });

module.exports = Class;
