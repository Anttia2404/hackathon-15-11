const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DiscussionResponse = sequelize.define('DiscussionResponse', {
  response_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  discussion_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'discussions',
      key: 'discussion_id',
    },
  },
  student_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'students',
      key: 'student_id',
    },
  },
  response_data: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
  is_anonymous: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  upvotes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'discussion_responses',
  timestamps: true,
  underscored: true,
});

// Define associations
DiscussionResponse.associate = (models) => {
  DiscussionResponse.belongsTo(models.Discussion, {
    foreignKey: 'discussion_id',
    as: 'Discussion',
  });
  DiscussionResponse.belongsTo(models.Student, {
    foreignKey: 'student_id',
    as: 'Student',
  });
};

module.exports = DiscussionResponse;
