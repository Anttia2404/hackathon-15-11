const pool = require('../db/pool');
const ApiResponse = require('../utils/apiResponse');

class StudyRoomController {
  // Create a new study room
  async createRoom(req, res, next) {
    const client = await pool.connect();
    try {
      const { room_name, max_participants = 10 } = req.body;
      const user_id = req.user.user_id;

      // Generate unique room code
      const room_code = Math.random().toString(36).substring(2, 8).toUpperCase();

      await client.query('BEGIN');

      // Create room
      const roomResult = await client.query(
        `INSERT INTO study_rooms (room_code, room_name, created_by, max_participants)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [room_code, room_name, user_id, max_participants]
      );

      const room = roomResult.rows[0];

      // Add creator as participant
      await client.query(
        `INSERT INTO study_room_participants (room_id, user_id, display_name, status)
         VALUES ($1, $2, $3, 'active')`,
        [room.room_id, user_id, req.user.full_name]
      );

      await client.query('COMMIT');

      return ApiResponse.success(res, room, 'Study room created successfully');
    } catch (error) {
      await client.query('ROLLBACK');
      next(error);
    } finally {
      client.release();
    }
  }

  // Join a study room
  async joinRoom(req, res, next) {
    const client = await pool.connect();
    try {
      const { room_code } = req.params;
      const user_id = req.user.user_id;

      // Find room
      const roomResult = await client.query(
        `SELECT * FROM study_rooms WHERE room_code = $1 AND is_active = true`,
        [room_code]
      );

      if (roomResult.rows.length === 0) {
        return ApiResponse.error(res, 'Room not found', 404);
      }

      const room = roomResult.rows[0];

      // Check if room is full
      const participantCount = await client.query(
        `SELECT COUNT(*) FROM study_room_participants 
         WHERE room_id = $1 AND left_at IS NULL`,
        [room.room_id]
      );

      if (parseInt(participantCount.rows[0].count) >= room.max_participants) {
        return ApiResponse.error(res, 'Room is full', 400);
      }

      // Add participant
      await client.query(
        `INSERT INTO study_room_participants (room_id, user_id, display_name, status)
         VALUES ($1, $2, $3, 'active')
         ON CONFLICT (room_id, user_id) 
         DO UPDATE SET left_at = NULL, status = 'active', joined_at = CURRENT_TIMESTAMP`,
        [room.room_id, user_id, req.user.full_name]
      );

      return ApiResponse.success(res, room, 'Joined room successfully');
    } catch (error) {
      next(error);
    } finally {
      client.release();
    }
  }

  // Get room details with participants
  async getRoomDetails(req, res, next) {
    try {
      const { room_code } = req.params;

      const roomResult = await pool.query(
        `SELECT r.*, u.full_name as creator_name
         FROM study_rooms r
         JOIN users u ON r.created_by = u.user_id
         WHERE r.room_code = $1 AND r.is_active = true`,
        [room_code]
      );

      if (roomResult.rows.length === 0) {
        return ApiResponse.error(res, 'Room not found', 404);
      }

      const room = roomResult.rows[0];

      // Get participants
      const participantsResult = await pool.query(
        `SELECT p.*, u.avatar_url
         FROM study_room_participants p
         JOIN users u ON p.user_id = u.user_id
         WHERE p.room_id = $1 AND p.left_at IS NULL
         ORDER BY p.joined_at ASC`,
        [room.room_id]
      );

      // Get goals
      const goalsResult = await pool.query(
        `SELECT g.*, u.full_name as user_name
         FROM study_room_goals g
         JOIN users u ON g.user_id = u.user_id
         WHERE g.room_id = $1
         ORDER BY g.created_at DESC`,
        [room.room_id]
      );

      return ApiResponse.success(res, {
        room,
        participants: participantsResult.rows,
        goals: goalsResult.rows,
      });
    } catch (error) {
      next(error);
    }
  }

  // Leave room
  async leaveRoom(req, res, next) {
    try {
      const { room_code } = req.params;
      const user_id = req.user.user_id;

      const roomResult = await pool.query(`SELECT room_id FROM study_rooms WHERE room_code = $1`, [
        room_code,
      ]);

      if (roomResult.rows.length === 0) {
        return ApiResponse.error(res, 'Room not found', 404);
      }

      await pool.query(
        `UPDATE study_room_participants 
         SET left_at = CURRENT_TIMESTAMP, status = 'away'
         WHERE room_id = $1 AND user_id = $2`,
        [roomResult.rows[0].room_id, user_id]
      );

      return ApiResponse.success(res, null, 'Left room successfully');
    } catch (error) {
      next(error);
    }
  }

  // Add study goal
  async addGoal(req, res, next) {
    try {
      const { room_code } = req.params;
      const { goal_text } = req.body;
      const user_id = req.user.user_id;

      const roomResult = await pool.query(
        `SELECT room_id FROM study_rooms WHERE room_code = $1 AND is_active = true`,
        [room_code]
      );

      if (roomResult.rows.length === 0) {
        return ApiResponse.error(res, 'Room not found', 404);
      }

      const goalResult = await pool.query(
        `INSERT INTO study_room_goals (room_id, user_id, goal_text)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [roomResult.rows[0].room_id, user_id, goal_text]
      );

      return ApiResponse.success(res, goalResult.rows[0], 'Goal added successfully');
    } catch (error) {
      next(error);
    }
  }

  // Toggle goal completion
  async toggleGoal(req, res, next) {
    try {
      const { goal_id } = req.params;
      const user_id = req.user.user_id;

      const result = await pool.query(
        `UPDATE study_room_goals 
         SET completed = NOT completed,
             completed_at = CASE WHEN completed = false THEN CURRENT_TIMESTAMP ELSE NULL END
         WHERE goal_id = $1 AND user_id = $2
         RETURNING *`,
        [goal_id, user_id]
      );

      if (result.rows.length === 0) {
        return ApiResponse.error(res, 'Goal not found', 404);
      }

      return ApiResponse.success(res, result.rows[0], 'Goal updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // Get friends list
  async getFriends(req, res, next) {
    try {
      const user_id = req.user.user_id;

      const result = await pool.query(
        `SELECT u.user_id, u.full_name, u.email, u.avatar_url, f.created_at as friend_since
         FROM friendships f
         JOIN users u ON (f.friend_id = u.user_id)
         WHERE f.user_id = $1 AND f.status = 'accepted'
         UNION
         SELECT u.user_id, u.full_name, u.email, u.avatar_url, f.created_at as friend_since
         FROM friendships f
         JOIN users u ON (f.user_id = u.user_id)
         WHERE f.friend_id = $1 AND f.status = 'accepted'
         ORDER BY full_name`,
        [user_id]
      );

      return ApiResponse.success(res, result.rows);
    } catch (error) {
      next(error);
    }
  }

  // Send friend request
  async sendFriendRequest(req, res, next) {
    try {
      const { friend_email } = req.body;
      const user_id = req.user.user_id;

      // Find friend by email
      const friendResult = await pool.query(`SELECT user_id FROM users WHERE email = $1`, [
        friend_email,
      ]);

      if (friendResult.rows.length === 0) {
        return ApiResponse.error(res, 'User not found', 404);
      }

      const friend_id = friendResult.rows[0].user_id;

      if (friend_id === user_id) {
        return ApiResponse.error(res, 'Cannot add yourself as friend', 400);
      }

      // Check if already friends
      const existingFriendship = await pool.query(
        `SELECT * FROM friendships 
         WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)`,
        [user_id, friend_id]
      );

      if (existingFriendship.rows.length > 0) {
        return ApiResponse.error(res, 'Friend request already exists', 400);
      }

      const result = await pool.query(
        `INSERT INTO friendships (user_id, friend_id, status)
         VALUES ($1, $2, 'pending')
         RETURNING *`,
        [user_id, friend_id]
      );

      return ApiResponse.success(res, result.rows[0], 'Friend request sent');
    } catch (error) {
      next(error);
    }
  }

  // Invite friend to room
  async inviteFriend(req, res, next) {
    try {
      const { room_code } = req.params;
      const { friend_id } = req.body;
      const user_id = req.user.user_id;

      const roomResult = await pool.query(
        `SELECT room_id FROM study_rooms WHERE room_code = $1 AND is_active = true`,
        [room_code]
      );

      if (roomResult.rows.length === 0) {
        return ApiResponse.error(res, 'Room not found', 404);
      }

      const result = await pool.query(
        `INSERT INTO study_room_invitations (room_id, invited_by, invited_user, status)
         VALUES ($1, $2, $3, 'pending')
         ON CONFLICT (room_id, invited_user) DO NOTHING
         RETURNING *`,
        [roomResult.rows[0].room_id, user_id, friend_id]
      );

      return ApiResponse.success(res, result.rows[0], 'Invitation sent');
    } catch (error) {
      next(error);
    }
  }

  // Get pending invitations
  async getPendingInvitations(req, res, next) {
    try {
      const user_id = req.user.user_id;

      const result = await pool.query(
        `SELECT i.*, r.room_code, r.room_name, u.full_name as invited_by_name
         FROM study_room_invitations i
         JOIN study_rooms r ON i.room_id = r.room_id
         JOIN users u ON i.invited_by = u.user_id
         WHERE i.invited_user = $1 AND i.status = 'pending' AND r.is_active = true
         ORDER BY i.created_at DESC`,
        [user_id]
      );

      return ApiResponse.success(res, result.rows);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StudyRoomController();
