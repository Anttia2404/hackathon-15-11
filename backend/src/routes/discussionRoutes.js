const express = require('express');
const discussionController = require('../controllers/discussionController');
const { authenticate, requireTeacher, requireStudent } = require('../middleware/auth');

const router = express.Router();

// Teacher routes
router.post('/', authenticate, requireTeacher, discussionController.createDiscussion);
router.get('/teacher', authenticate, requireTeacher, discussionController.getTeacherDiscussions);
router.get('/:id', authenticate, requireTeacher, discussionController.getDiscussionById);
router.patch('/:id/status', authenticate, requireTeacher, discussionController.updateDiscussionStatus);
router.delete('/:id', authenticate, requireTeacher, discussionController.deleteDiscussion);
router.patch('/responses/:id/feature', authenticate, requireTeacher, discussionController.featureResponse);

// Student routes
router.post('/join', authenticate, requireStudent, discussionController.joinDiscussion);
router.post('/responses', authenticate, requireStudent, discussionController.submitResponse);
router.post('/responses/:id/upvote', authenticate, discussionController.upvoteResponse);

module.exports = router;
