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

// Export all models and sequelize instance
module.exports = {
  sequelize,
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
