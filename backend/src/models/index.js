// Central model index file
const { sequelize } = require('../config/database');

// Import all models
const User = require('./User');
const Student = require('./Student');
const Teacher = require('./Teacher');
const Course = require('./Course');
const Class = require('./Class');
const Deadline = require('./Deadline');
const StudyPlan = require('./StudyPlan');
const Quiz = require('./Quiz');
const Discussion = require('./Discussion');
const DiscussionResponse = require('./DiscussionResponse');

// Setup associations
const models = {
  User,
  Student,
  Teacher,
  Course,
  Class,
  Deadline,
  StudyPlan,
  Quiz,
  Discussion,
  DiscussionResponse,
};

// Call associate methods if they exist
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Export all models and sequelize instance
module.exports = {
  sequelize,
  ...models,
};
