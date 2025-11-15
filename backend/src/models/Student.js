const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Student = sequelize.define(
  'student',
  {
    student_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'user_id',
      },
    },
    student_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    major: {
      type: DataTypes.STRING(100),
    },
    year: {
      type: DataTypes.INTEGER,
    },
    gpa: {
      type: DataTypes.DECIMAL(3, 2),
    },
    target_gpa: {
      type: DataTypes.DECIMAL(3, 2),
    },
  },
  {
    tableName: 'students',
    timestamps: false,
  }
);

// Associations - explicitly set the association
Student.belongsTo(User, { 
  foreignKey: 'user_id',
  as: 'User',
  onDelete: 'CASCADE' 
});
User.hasOne(Student, { foreignKey: 'user_id' });

module.exports = Student;
