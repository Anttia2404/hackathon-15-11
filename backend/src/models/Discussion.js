const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Discussion = sequelize.define('Discussion', {
  discussion_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  teacher_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'teachers',
      key: 'teacher_id',
    },
  },
  class_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'classes',
      key: 'class_id',
    },
  },
  title: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  type: {
    type: DataTypes.ENUM('poll', 'qna', 'wordcloud', 'quiz', 'feedback'),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('draft', 'active', 'closed', 'archived'),
    defaultValue: 'draft',
  },
  settings: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
  pin_code: {
    type: DataTypes.STRING(6),
    unique: true,
  },
  expires_at: {
    type: DataTypes.DATE,
  },
  total_responses: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'discussions',
  timestamps: true,
  underscored: true,
});

// Define associations
Discussion.associate = (models) => {
  Discussion.belongsTo(models.Teacher, {
    foreignKey: 'teacher_id',
    as: 'Teacher',
  });
  Discussion.belongsTo(models.Class, {
    foreignKey: 'class_id',
    as: 'Class',
  });
  Discussion.hasMany(models.DiscussionResponse, {
    foreignKey: 'discussion_id',
    as: 'Responses',
  });
};

module.exports = Discussion;
