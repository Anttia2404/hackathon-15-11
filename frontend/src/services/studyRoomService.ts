import api from "../config/api";

export interface StudyRoom {
  room_id: string;
  room_code: string;
  room_name: string;
  created_by: string;
  max_participants: number;
  is_active: boolean;
  created_at: string;
  creator_name?: string;
}

export interface Participant {
  participant_id: string;
  room_id: string;
  user_id: string;
  display_name: string;
  joined_at: string;
  left_at: string | null;
  status: "active" | "break" | "away";
  study_time: number;
  avatar_url?: string;
}

export interface StudyGoal {
  goal_id: string;
  room_id: string;
  user_id: string;
  goal_text: string;
  completed: boolean;
  created_at: string;
  completed_at: string | null;
  user_name?: string;
}

export interface Friend {
  user_id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  friend_since: string;
}

export interface Invitation {
  invitation_id: string;
  room_id: string;
  room_code: string;
  room_name: string;
  invited_by: string;
  invited_by_name: string;
  status: "pending" | "accepted" | "declined";
  created_at: string;
}

class StudyRoomService {
  // Create a new study room
  async createRoom(
    room_name: string,
    max_participants: number = 10
  ): Promise<StudyRoom> {
    const response = await api.post("/study-rooms/create", {
      room_name,
      max_participants,
    });
    return response.data.data;
  }

  // Join a study room by code
  async joinRoom(room_code: string): Promise<StudyRoom> {
    const response = await api.post(`/study-rooms/join/${room_code}`);
    return response.data.data;
  }

  // Get room details with participants and goals
  async getRoomDetails(room_code: string): Promise<{
    room: StudyRoom;
    participants: Participant[];
    goals: StudyGoal[];
  }> {
    const response = await api.get(`/study-rooms/${room_code}`);
    return response.data.data;
  }

  // Leave a room
  async leaveRoom(room_code: string): Promise<void> {
    await api.post(`/study-rooms/${room_code}/leave`);
  }

  // Add a study goal
  async addGoal(room_code: string, goal_text: string): Promise<StudyGoal> {
    const response = await api.post(`/study-rooms/${room_code}/goals`, {
      goal_text,
    });
    return response.data.data;
  }

  // Toggle goal completion
  async toggleGoal(goal_id: string): Promise<StudyGoal> {
    const response = await api.patch(`/study-rooms/goals/${goal_id}/toggle`);
    return response.data.data;
  }

  // Get friends list
  async getFriends(): Promise<Friend[]> {
    const response = await api.get("/study-rooms/friends/list");
    return response.data.data;
  }

  // Send friend request
  async sendFriendRequest(friend_email: string): Promise<void> {
    await api.post("/study-rooms/friends/request", {
      friend_email,
    });
  }

  // Invite friend to room
  async inviteFriend(room_code: string, friend_id: string): Promise<void> {
    await api.post(`/study-rooms/${room_code}/invite`, {
      friend_id,
    });
  }

  // Get pending invitations
  async getPendingInvitations(): Promise<Invitation[]> {
    const response = await api.get("/study-rooms/invitations/pending");
    return response.data.data;
  }
}

export const studyRoomService = new StudyRoomService();
