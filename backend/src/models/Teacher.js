const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Teacher = sequelize.define(
  'teacher',
  {
    teacher_id: {
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
    teacher_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    department: {
      type: DataTypes.STRING(100),
    },
    specialization: {
      type: DataTypes.STRING(200),
    },
  },
  {
    tableName: 'teachers',
    timestamps: false,
  }
);

// Associations
Teacher.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });
User.hasOne(Teacher, { foreignKey: 'user_id' });

module.exports = Teacher;
