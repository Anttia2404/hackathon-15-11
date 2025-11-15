-- Study Room Tables Migration
-- Run this file manually in your PostgreSQL database

CREATE TABLE IF NOT EXISTS study_rooms (
  room_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_code VARCHAR(8) UNIQUE NOT NULL,
  room_name VARCHAR(255) NOT NULL,
  created_by UUID REFERENCES users(user_id) ON DELETE CASCADE,
  max_participants INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS study_room_participants (
  participant_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES study_rooms(room_id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  display_name VARCHAR(255) NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  left_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active',
  study_time INTEGER DEFAULT 0,
  UNIQUE(room_id, user_id)
);

CREATE TABLE IF NOT EXISTS study_room_goals (
  goal_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES study_rooms(room_id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  goal_text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS study_room_invitations (
  invitation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES study_rooms(room_id) ON DELETE CASCADE,
  invited_by UUID REFERENCES users(user_id) ON DELETE CASCADE,
  invited_user UUID REFERENCES users(user_id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP,
  UNIQUE(room_id, invited_user)
);

CREATE TABLE IF NOT EXISTS friendships (
  friendship_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  friend_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  accepted_at TIMESTAMP,
  CHECK (user_id != friend_id),
  UNIQUE(user_id, friend_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_study_rooms_code ON study_rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_study_rooms_created_by ON study_rooms(created_by);
CREATE INDEX IF NOT EXISTS idx_study_room_participants_room ON study_room_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_study_room_participants_user ON study_room_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_study_room_goals_room ON study_room_goals(room_id);
CREATE INDEX IF NOT EXISTS idx_study_room_invitations_user ON study_room_invitations(invited_user);
CREATE INDEX IF NOT EXISTS idx_friendships_user ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend ON friendships(friend_id);
