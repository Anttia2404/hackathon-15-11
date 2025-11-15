const express = require('express');
const router = express.Router();
const studyRoomController = require('../controllers/studyRoomController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Room management
router.post('/create', studyRoomController.createRoom);
router.post('/join/:room_code', studyRoomController.joinRoom);
router.get('/:room_code', studyRoomController.getRoomDetails);
router.post('/:room_code/leave', studyRoomController.leaveRoom);

// Goals
router.post('/:room_code/goals', studyRoomController.addGoal);
router.patch('/goals/:goal_id/toggle', studyRoomController.toggleGoal);

// Friends
router.get('/friends/list', studyRoomController.getFriends);
router.post('/friends/request', studyRoomController.sendFriendRequest);

// Invitations
router.post('/:room_code/invite', studyRoomController.inviteFriend);
router.get('/invitations/pending', studyRoomController.getPendingInvitations);

module.exports = router;
