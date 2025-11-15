import { useState, useEffect, useCallback } from 'react';

export interface Participant {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'away' | 'offline';
  focusTime: number;
  lastActive: number;
}

export interface StudyGoal {
  id: string;
  text: string;
  completed: boolean;
  addedBy: string;
  addedByName: string;
}

export interface PomodoroState {
  time: number;
  isRunning: boolean;
  mode: 'focus' | 'break';
  sessions: number;
  startedBy: string | null;
  startedByName: string | null;
  startedAt: number | null;
}

export interface RoomState {
  roomId: string;
  roomName: string;
  createdBy: string;
  createdAt: number;
  lastUpdated: number;
  participants: Participant[];
  studyGoals: StudyGoal[];
  sharedNotes: string;
  pomodoro: PomodoroState;
  activities: Activity[];
}

export interface Activity {
  id: string;
  type: 'join' | 'leave' | 'goal_added' | 'goal_completed' | 'pomodoro_started' | 'pomodoro_paused';
  userId: string;
  userName: string;
  message: string;
  timestamp: number;
}

const STORAGE_KEY_PREFIX = 'study_room_';
const SYNC_INTERVAL = 2000; // 2 seconds
const ACTIVITY_TIMEOUT = 30000; // 30 seconds for online status

export function useRoomSync(roomId: string | null, currentUser: { id: string; name: string }) {
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [lastSync, setLastSync] = useState<number>(Date.now());
  const [isConnected, setIsConnected] = useState(false);

  // Get storage key
  const getStorageKey = useCallback((id: string) => {
    return `${STORAGE_KEY_PREFIX}${id}`;
  }, []);

  // Load room from localStorage
  const loadRoom = useCallback((id: string): RoomState | null => {
    try {
      const key = getStorageKey(id);
      const data = localStorage.getItem(key);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading room:', error);
    }
    return null;
  }, [getStorageKey]);

  // Save room to localStorage
  const saveRoom = useCallback((state: RoomState) => {
    try {
      const key = getStorageKey(state.roomId);
      const updated = {
        ...state,
        lastUpdated: Date.now(),
      };
      localStorage.setItem(key, JSON.stringify(updated));
      setLastSync(updated.lastUpdated);
    } catch (error) {
      console.error('Error saving room:', error);
    }
  }, [getStorageKey]);

  // Create new room
  const createRoom = useCallback((roomName: string): string => {
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newRoom: RoomState = {
      roomId: newRoomId,
      roomName,
      createdBy: currentUser.id,
      createdAt: Date.now(),
      lastUpdated: Date.now(),
      participants: [
        {
          id: currentUser.id,
          name: currentUser.name,
          avatar: '👤',
          status: 'online',
          focusTime: 0,
          lastActive: Date.now(),
        },
      ],
      studyGoals: [],
      sharedNotes: '# Study Notes\n\nStart taking notes here...\n',
      pomodoro: {
        time: 1500,
        isRunning: false,
        mode: 'focus',
        sessions: 0,
        startedBy: null,
        startedByName: null,
        startedAt: null,
      },
      activities: [
        {
          id: Date.now().toString(),
          type: 'join',
          userId: currentUser.id,
          userName: currentUser.name,
          message: `${currentUser.name} created the room`,
          timestamp: Date.now(),
        },
      ],
    };
    saveRoom(newRoom);
    setRoomState(newRoom);
    setIsConnected(true);
    return newRoomId;
  }, [currentUser, saveRoom]);

  // Join existing room
  const joinRoom = useCallback((id: string): boolean => {
    const room = loadRoom(id);
    if (!room) {
      return false;
    }

    // Check if user already in room
    const existingParticipant = room.participants.find((p) => p.id === currentUser.id);
    if (!existingParticipant) {
      // Add new participant
      room.participants.push({
        id: currentUser.id,
        name: currentUser.name,
        avatar: '👤',
        status: 'online',
        focusTime: 0,
        lastActive: Date.now(),
      });

      // Add activity
      room.activities.push({
        id: Date.now().toString(),
        type: 'join',
        userId: currentUser.id,
        userName: currentUser.name,
        message: `${currentUser.name} joined the room`,
        timestamp: Date.now(),
      });
    } else {
      // Update existing participant
      existingParticipant.status = 'online';
      existingParticipant.lastActive = Date.now();
    }

    saveRoom(room);
    setRoomState(room);
    setIsConnected(true);
    return true;
  }, [currentUser, loadRoom, saveRoom]);

  // Leave room
  const leaveRoom = useCallback(() => {
    if (!roomState) return;

    const updated = { ...roomState };
    const participant = updated.participants.find((p) => p.id === currentUser.id);
    if (participant) {
      participant.status = 'offline';
      participant.lastActive = Date.now();
    }

    updated.activities.push({
      id: Date.now().toString(),
      type: 'leave',
      userId: currentUser.id,
      userName: currentUser.name,
      message: `${currentUser.name} left the room`,
      timestamp: Date.now(),
    });

    saveRoom(updated);
    setRoomState(null);
    setIsConnected(false);
  }, [roomState, currentUser, saveRoom]);

  // Update participant activity
  const updateActivity = useCallback(() => {
    if (!roomState) return;

    const updated = { ...roomState };
    const participant = updated.participants.find((p) => p.id === currentUser.id);
    if (participant) {
      participant.lastActive = Date.now();
      participant.status = 'online';
    }

    saveRoom(updated);
  }, [roomState, currentUser, saveRoom]);

  // Add study goal
  const addGoal = useCallback((text: string) => {
    if (!roomState) return;

    const newGoal: StudyGoal = {
      id: Date.now().toString(),
      text,
      completed: false,
      addedBy: currentUser.id,
      addedByName: currentUser.name,
    };

    const updated = {
      ...roomState,
      studyGoals: [...roomState.studyGoals, newGoal],
      activities: [
        ...roomState.activities,
        {
          id: Date.now().toString(),
          type: 'goal_added' as const,
          userId: currentUser.id,
          userName: currentUser.name,
          message: `${currentUser.name} added a goal`,
          timestamp: Date.now(),
        },
      ],
    };

    saveRoom(updated);
    setRoomState(updated);
  }, [roomState, currentUser, saveRoom]);

  // Toggle goal completion
  const toggleGoal = useCallback((goalId: string) => {
    if (!roomState) return;

    const updated = { ...roomState };
    const goal = updated.studyGoals.find((g) => g.id === goalId);
    if (goal) {
      goal.completed = !goal.completed;

      if (goal.completed) {
        updated.activities.push({
          id: Date.now().toString(),
          type: 'goal_completed',
          userId: currentUser.id,
          userName: currentUser.name,
          message: `${currentUser.name} completed: ${goal.text}`,
          timestamp: Date.now(),
        });
      }
    }

    saveRoom(updated);
    setRoomState(updated);
  }, [roomState, currentUser, saveRoom]);

  // Update shared notes
  const updateNotes = useCallback((notes: string) => {
    if (!roomState) return;

    const updated = {
      ...roomState,
      sharedNotes: notes,
    };

    saveRoom(updated);
    setRoomState(updated);
  }, [roomState, saveRoom]);

  // Start pomodoro
  const startPomodoro = useCallback(() => {
    if (!roomState) return;

    const updated = {
      ...roomState,
      pomodoro: {
        ...roomState.pomodoro,
        isRunning: true,
        startedBy: currentUser.id,
        startedByName: currentUser.name,
        startedAt: Date.now(),
      },
      activities: [
        ...roomState.activities,
        {
          id: Date.now().toString(),
          type: 'pomodoro_started' as const,
          userId: currentUser.id,
          userName: currentUser.name,
          message: `${currentUser.name} started the timer`,
          timestamp: Date.now(),
        },
      ],
    };

    saveRoom(updated);
    setRoomState(updated);
  }, [roomState, currentUser, saveRoom]);

  // Pause pomodoro
  const pausePomodoro = useCallback(() => {
    if (!roomState) return;

    const updated = {
      ...roomState,
      pomodoro: {
        ...roomState.pomodoro,
        isRunning: false,
      },
      activities: [
        ...roomState.activities,
        {
          id: Date.now().toString(),
          type: 'pomodoro_paused' as const,
          userId: currentUser.id,
          userName: currentUser.name,
          message: `${currentUser.name} paused the timer`,
          timestamp: Date.now(),
        },
      ],
    };

    saveRoom(updated);
    setRoomState(updated);
  }, [roomState, currentUser, saveRoom]);

  // Update pomodoro time
  const updatePomodoroTime = useCallback((time: number) => {
    if (!roomState) return;

    const updated = {
      ...roomState,
      pomodoro: {
        ...roomState.pomodoro,
        time,
      },
    };

    saveRoom(updated);
    setRoomState(updated);
  }, [roomState, saveRoom]);

  // Sync with localStorage (polling)
  useEffect(() => {
    if (!roomId || !isConnected) return;

    const interval = setInterval(() => {
      const latest = loadRoom(roomId);
      if (latest && latest.lastUpdated > lastSync) {
        setRoomState(latest);
        setLastSync(latest.lastUpdated);
      }

      // Update activity
      updateActivity();
    }, SYNC_INTERVAL);

    return () => clearInterval(interval);
  }, [roomId, isConnected, lastSync, loadRoom, updateActivity]);

  // Update participant statuses
  useEffect(() => {
    if (!roomState) return;

    const now = Date.now();
    let hasChanges = false;
    const updated = { ...roomState };

    updated.participants = updated.participants.map((p) => {
      const timeSinceActive = now - p.lastActive;
      let newStatus = p.status;

      if (timeSinceActive < ACTIVITY_TIMEOUT) {
        newStatus = 'online';
      } else if (timeSinceActive < 5 * 60 * 1000) {
        newStatus = 'away';
      } else {
        newStatus = 'offline';
      }

      if (newStatus !== p.status) {
        hasChanges = true;
        return { ...p, status: newStatus };
      }
      return p;
    });

    if (hasChanges) {
      setRoomState(updated);
    }
  }, [roomState]);

  return {
    roomState,
    isConnected,
    actions: {
      createRoom,
      joinRoom,
      leaveRoom,
      addGoal,
      toggleGoal,
      updateNotes,
      startPomodoro,
      pausePomodoro,
      updatePomodoroTime,
    },
  };
}
