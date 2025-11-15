import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import {
  Users,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Check,
  BookOpen,
  Target,
  Sparkles,
  Copy,
  LogOut,
  MessageSquare,
  Video,
  Mic,
  Monitor,
  Code,
  PenTool,
  Share2,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { toast } from "sonner";
import { VideoCallTab } from "./VideoCallTab";
import { WhiteboardTab } from "./WhiteboardTab";
import { CodeEditorTab } from "./CodeEditorTab";
import { useAuth } from "../../contexts/AuthContext";
import {
  studyRoomService,
  type StudyRoom as StudyRoomType,
  type Participant,
  type StudyGoal as StudyGoalType,
  type Friend,
} from "../../services/studyRoomService";

export function StudyRoom() {
  const { user } = useAuth();
  const [roomData, setRoomData] = useState<StudyRoomType | null>(null);
  const [joinRoomId, setJoinRoomId] = useState("");
  const [isInRoom, setIsInRoom] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // Pomodoro Timer
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useState(0);

  // Feature tabs
  const [activeTab, setActiveTab] = useState<
    "timer" | "whiteboard" | "code" | "video"
  >("timer");

  // Participants and goals from API
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [goals, setGoals] = useState<StudyGoalType[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [newGoal, setNewGoal] = useState("");
  const [friendEmail, setFriendEmail] = useState("");

  // Shared Notes
  const [notes, setNotes] = useState(
    "# Study Notes\n\n- Topic: Machine Learning\n- Focus: Neural Networks\n"
  );

  // Load room data periodically
  useEffect(() => {
    if (isInRoom && roomData) {
      loadRoomData();
      const interval = setInterval(loadRoomData, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [isInRoom, roomData?.room_code]);

  // Load friends list
  useEffect(() => {
    if (user) {
      loadFriends();
    }
  }, [user]);

  const loadRoomData = async () => {
    if (!roomData) return;
    try {
      const data = await studyRoomService.getRoomDetails(roomData.room_code);
      setParticipants(data.participants);
      setGoals(data.goals);
    } catch (error) {
      console.error("Error loading room data:", error);
    }
  };

  const loadFriends = async () => {
    try {
      const friendsList = await studyRoomService.getFriends();
      setFriends(friendsList);
    } catch (error) {
      console.error("Error loading friends:", error);
    }
  };

  // Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Timer finished
      if (!isBreak) {
        setSessions((prev) => prev + 1);
        setIsBreak(true);
        setTimeLeft(5 * 60); // 5 min break
      } else {
        setIsBreak(false);
        setTimeLeft(25 * 60); // Back to work
      }
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isBreak]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleCreateRoom = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập");
      return;
    }

    setLoading(true);
    try {
      const room = await studyRoomService.createRoom(
        `${user.full_name}'s Study Room`
      );
      setRoomData(room);
      setIsInRoom(true);
      toast.success(`Đã tạo phòng ${room.room_code}!`);
      await loadRoomData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tạo phòng");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập");
      return;
    }
    if (!joinRoomId.trim()) {
      toast.error("Vui lòng nhập mã phòng");
      return;
    }

    setLoading(true);
    try {
      const room = await studyRoomService.joinRoom(
        joinRoomId.trim().toUpperCase()
      );
      setRoomData(room);
      setIsInRoom(true);
      toast.success(`Đã tham gia phòng ${room.room_code}!`);
      await loadRoomData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tham gia phòng");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyRoomCode = async () => {
    if (!roomData) return;
    try {
      await navigator.clipboard.writeText(roomData.room_code);
      setCopied(true);
      toast.success("Đã copy mã phòng!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Không thể copy mã phòng");
    }
  };

  const handleCopyInviteLink = async () => {
    if (!roomData) return;
    const inviteLink = `${window.location.origin}/study-room?room=${roomData.room_code}`;
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success("Đã copy link mời!");
    } catch (err) {
      toast.error("Không thể copy link");
    }
  };

  const handleAddGoal = async () => {
    if (!newGoal.trim() || !roomData) return;

    try {
      const goal = await studyRoomService.addGoal(roomData.room_code, newGoal);
      setGoals([...goals, goal]);
      setNewGoal("");
      toast.success("Đã thêm mục tiêu!");
    } catch (error) {
      toast.error("Không thể thêm mục tiêu");
    }
  };

  const toggleGoal = async (goal_id: string) => {
    try {
      const updatedGoal = await studyRoomService.toggleGoal(goal_id);
      setGoals(goals.map((g) => (g.goal_id === goal_id ? updatedGoal : g)));
    } catch (error) {
      toast.error("Không thể cập nhật mục tiêu");
    }
  };

  const handleAddFriend = async () => {
    if (!friendEmail.trim()) {
      toast.error("Vui lòng nhập email bạn bè");
      return;
    }

    try {
      await studyRoomService.sendFriendRequest(friendEmail);
      toast.success("Đã gửi lời mời kết bạn!");
      setFriendEmail("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể gửi lời mời");
    }
  };

  const handleInviteFriend = async (friend_id: string) => {
    if (!roomData) return;

    try {
      await studyRoomService.inviteFriend(roomData.room_code, friend_id);
      toast.success("Đã mời bạn vào phòng!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể mời bạn");
    }
  };

  const handleLeaveRoom = async () => {
    if (!roomData) return;

    try {
      await studyRoomService.leaveRoom(roomData.room_code);
      setIsInRoom(false);
      setRoomData(null);
      toast.success("Đã rời phòng");
    } catch (error) {
      toast.error("Không thể rời phòng");
    }
  };

  if (!isInRoom) {
    // Landing Page - Create/Join Room
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        {/* Compact Header Banner */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            {/* Compact Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-black mb-4 text-gray-900">
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Study Room
                </span>
              </h1>
              <p className="text-gray-600 text-lg font-medium max-w-xl mx-auto">
                Không gian học nhóm thông minh với AI-powered tools 🚀
              </p>
            </div>

            {/* Main Card Container */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="max-w-4xl mx-auto mb-6"
              style={{
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
              }}
            >
              <Card className="p-4 bg-white border-0 rounded-3xl">
                {/* Welcome Message */}
                <div className="text-center mb-8">
                  <p className="text-gray-700 font-medium">
                    Xin chào,{" "}
                    <span className="text-indigo-600 font-bold">
                      {user?.full_name}
                    </span>
                    ! 👋
                  </p>
                </div>

                {/* Action Cards */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Create Room */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="relative"
                  >
                    <div
                      className="p-6 hover:shadow-xl transition-all duration-500 bg-white rounded-2xl"
                      style={{
                        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
                      }}
                    >
                      <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white text-xs font-bold">1</span>
                      </div>

                      <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-5 shadow-lg mx-auto">
                        <Plus className="w-8 h-8 text-white" />
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-3 text-center">
                        Khởi tạo phòng học nhóm
                      </h3>
                      <p className="text-gray-600 mb-6 leading-relaxed text-center text-sm">
                        Tạo không gian học tập riêng tư và mời bạn bè cùng tham
                        gia
                      </p>

                      <Button
                        onClick={handleCreateRoom}
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 font-bold rounded-xl transition-all duration-300"
                        style={{
                          boxShadow: "0 8px 25px rgba(168, 85, 247, 0.4)",
                        }}
                      >
                        <Plus className="mr-2 w-5 h-5" />
                        {loading ? "Đang tạo..." : "🚀 Tạo phòng mới"}
                      </Button>
                    </div>
                  </motion.div>

                  {/* Join Room */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="relative"
                  >
                    <div
                      className="p-4 hover:shadow-xl transition-all duration-500 bg-white rounded-2xl"
                      style={{
                        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
                      }}
                    >
                      <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white text-xs font-bold">2</span>
                      </div>

                      <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mb-5 shadow-lg mx-auto">
                        <ArrowRight className="w-8 h-8 text-white" />
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-3 text-center">
                        Vào phòng học cùng bạn bè
                      </h3>
                      <p className="text-gray-600 mb-6 leading-relaxed text-center text-sm">
                        Nhập mã phòng để nhanh chóng tham gia học nhóm đã có sẵn
                      </p>

                      <div className="space-y-4">
                        <div
                          className="rounded-xl"
                          style={{
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                          }}
                        >
                          <input
                            type="text"
                            placeholder="Mã phòng (VD: ABC123)"
                            value={joinRoomId}
                            onChange={(e) =>
                              setJoinRoomId(e.target.value.toUpperCase())
                            }
                            className="w-full px-4 py-4 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-300 transition-all bg-gray-50 hover:bg-gray-100 font-medium text-center"
                            onKeyPress={(e) =>
                              e.key === "Enter" && handleJoinRoom()
                            }
                          />
                        </div>
                        <Button
                          onClick={handleJoinRoom}
                          disabled={loading || !joinRoomId.trim()}
                          className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 font-bold rounded-xl transition-all duration-300"
                          style={{
                            boxShadow: "0 8px 25px rgba(6, 182, 212, 0.4)",
                          }}
                        >
                          <ArrowRight className="mr-2 w-5 h-5" />
                          {loading ? "Đang tham gia..." : "Tham gia ngay! 🎯"}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </Card>
            </motion.div>

            {/* Study Room Tools */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="max-w-2xl mx-auto"
            >
              <div
                className="p-4 bg-white rounded-2xl border-0"
                style={{
                  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
                }}
              >
                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    🛠️ Study Room Tools
                  </h3>
                  <p className="text-gray-500 text-sm">Real-time Tools</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                  {[
                    {
                      icon: Clock,
                      label: "Pomodoro Timer",
                      color: "from-blue-500 to-cyan-500",
                    },
                    {
                      icon: Target,
                      label: "Study Goals",
                      color: "from-green-500 to-emerald-500",
                    },
                    {
                      icon: BookOpen,
                      label: "Shared Notes",
                      color: "from-orange-500 to-red-500",
                    },
                    {
                      icon: Sparkles,
                      label: "Real-time Sync",
                      color: "from-purple-500 to-pink-500",
                    },
                  ].map((feature, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + idx * 0.1 }}
                      className="text-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300"
                      style={{
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                      }}
                    >
                      <div
                        className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg`}
                      >
                        <feature.icon className="w-7 h-7 text-white" />
                      </div>
                      <p className="text-sm font-semibold text-gray-700 leading-tight">
                        {feature.label}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Study Room Interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Study Room</h1>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full text-sm font-medium border border-indigo-200">
                    ID: {roomData?.room_code}
                  </span>
                  <button
                    onClick={handleCopyRoomCode}
                    className="p-1.5 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-all"
                    title="Copy mã phòng"
                  >
                    {copied ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                ⚙️ Settings
              </Button>
              <Button
                variant="outline"
                onClick={handleLeaveRoom}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <LogOut className="mr-2 w-4 h-4" />
                🚪 Rời phòng
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Features */}
          <div className="lg:col-span-2 space-y-6">
            {/* Feature Tabs */}
            <Card className="p-4 bg-white shadow-xl rounded-2xl border border-gray-100">
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as typeof activeTab)}
              >
                <TabsList className="inline-flex w-full h-auto bg-gray-50/80 p-1.5 rounded-xl border border-gray-200/50 mb-6 gap-1.5 overflow-hidden">
                  <TabsTrigger
                    value="timer"
                    className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 md:px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-[1.02] hover:bg-gray-100 data-[state=active]:hover:from-indigo-600 data-[state=active]:hover:to-purple-600 min-w-0 flex-shrink-0"
                  >
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    <span className="hidden sm:inline font-medium">Timer</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="video"
                    className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 md:px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-[1.02] hover:bg-gray-100 data-[state=active]:hover:from-blue-600 data-[state=active]:hover:to-cyan-600 min-w-0 flex-shrink-0"
                  >
                    <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    <span className="hidden sm:inline font-medium">Video</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="whiteboard"
                    className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 md:px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-[1.02] hover:bg-gray-100 data-[state=active]:hover:from-purple-600 data-[state=active]:hover:to-pink-600 min-w-0 flex-shrink-0"
                  >
                    <PenTool className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    <span className="hidden sm:inline font-medium">Board</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="code"
                    className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 md:px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-[1.02] hover:bg-gray-100 data-[state=active]:hover:from-green-600 data-[state=active]:hover:to-emerald-600 min-w-0 flex-shrink-0"
                  >
                    <Code className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    <span className="hidden sm:inline font-medium">Code</span>
                  </TabsTrigger>
                </TabsList>

                {/* Timer Tab */}
                <TabsContent value="timer" className="space-y-4 mt-0">
                  {/* Pomodoro Timer */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Card className="p-4 bg-gradient-to-br from-white to-indigo-50/50 border-2 border-indigo-100 rounded-xl">
                      <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 rounded-full mb-6">
                          <Clock className="w-4 h-4 text-indigo-600" />
                          <span className="text-sm font-medium text-indigo-700">
                            {isBreak ? "Break Time 🎉" : "Focus Time 🎯"}
                          </span>
                        </div>

                        <div className="relative w-64 h-64 mx-auto mb-8">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle
                              cx="128"
                              cy="128"
                              r="120"
                              stroke="#e5e7eb"
                              strokeWidth="8"
                              fill="none"
                            />
                            <circle
                              cx="128"
                              cy="128"
                              r="120"
                              stroke="url(#gradient)"
                              strokeWidth="8"
                              fill="none"
                              strokeDasharray={`${2 * Math.PI * 120}`}
                              strokeDashoffset={`${
                                2 *
                                Math.PI *
                                120 *
                                (1 - timeLeft / (isBreak ? 300 : 1500))
                              }`}
                              strokeLinecap="round"
                              className="transition-all duration-1000"
                            />
                            <defs>
                              <linearGradient
                                id="gradient"
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="100%"
                              >
                                <stop offset="0%" stopColor="#6366f1" />
                                <stop offset="100%" stopColor="#a855f7" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                              {formatTime(timeLeft)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-center gap-4 mb-6">
                          <Button
                            onClick={() => setIsRunning(!isRunning)}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 px-8"
                          >
                            {isRunning ? (
                              <>
                                <Pause className="mr-2 w-5 h-5" />
                                Pause
                              </>
                            ) : (
                              <>
                                <Play className="mr-2 w-5 h-5" />
                                Start
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setTimeLeft(isBreak ? 300 : 1500);
                              setIsRunning(false);
                            }}
                            className="border-gray-300"
                          >
                            <RotateCcw className="mr-2 w-4 h-4" />
                            Reset
                          </Button>
                        </div>

                        <div className="flex items-center justify-center gap-8 text-sm">
                          <div>
                            <span className="text-gray-600">Sessions: </span>
                            <span className="font-semibold text-indigo-600">
                              {sessions}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Mode: </span>
                            <span className="font-semibold text-purple-600">
                              {isBreak ? "Break" : "Focus"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                </TabsContent>

                {/* Video Call Tab */}
                <TabsContent value="video" className="space-y-6 mt-0">
                  {roomData?.room_code ? (
                    <VideoCallTab
                      roomId={roomData.room_code}
                      participants={participants}
                    />
                  ) : (
                    <div className="p-8 bg-gradient-to-br from-white to-blue-50/50 border-2 border-blue-100 rounded-xl text-center">
                      <Video className="w-16 h-16 mx-auto mb-4 text-blue-600" />
                      <h3 className="text-xl font-semibold mb-2">Video Call</h3>
                      <p className="text-gray-600 mb-6">
                        Vui lòng tạo hoặc tham gia phòng để sử dụng Video Call
                      </p>
                    </div>
                  )}
                </TabsContent>

                {/* Whiteboard Tab */}
                <TabsContent value="whiteboard" className="space-y-6 mt-0">
                  {roomData?.room_code ? (
                    <WhiteboardTab roomId={roomData.room_code} />
                  ) : (
                    <div className="p-8 bg-gradient-to-br from-white to-purple-50/50 border-2 border-purple-100 rounded-xl text-center">
                      <PenTool className="w-16 h-16 mx-auto mb-4 text-purple-600" />
                      <h3 className="text-xl font-semibold mb-2">Whiteboard</h3>
                      <p className="text-gray-600 mb-6">
                        Vui lòng tạo hoặc tham gia phòng để sử dụng Whiteboard
                      </p>
                    </div>
                  )}
                </TabsContent>

                {/* Code Tab */}
                <TabsContent value="code" className="space-y-6 mt-0">
                  {roomData?.room_code ? (
                    <CodeEditorTab roomId={roomData.room_code} />
                  ) : (
                    <div className="p-8 bg-gradient-to-br from-white to-green-50/50 border-2 border-green-100 rounded-xl text-center">
                      <Code className="w-16 h-16 mx-auto mb-4 text-green-600" />
                      <h3 className="text-xl font-semibold mb-2">
                        Code Editor
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Vui lòng tạo hoặc tham gia phòng để sử dụng Code Editor
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </Card>

            {/* Study Goals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 bg-white shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Study Goals
                  </h3>
                </div>

                <div className="space-y-3 mb-4">
                  <AnimatePresence>
                    {goals.map((goal) => (
                      <motion.div
                        key={goal.goal_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all shadow-sm ${
                          goal.completed
                            ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-green-100"
                            : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-300 hover:shadow-md"
                        }`}
                      >
                        <button
                          onClick={() => toggleGoal(goal.goal_id)}
                          className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all shadow-sm ${
                            goal.completed
                              ? "bg-gradient-to-r from-green-500 to-emerald-500 border-green-400 shadow-green-200"
                              : "border-blue-300 hover:border-blue-500 hover:bg-blue-50"
                          }`}
                        >
                          {goal.completed && (
                            <Check className="w-4 h-4 text-white" />
                          )}
                        </button>
                        <div className="flex-1">
                          <span
                            className={`font-medium ${
                              goal.completed
                                ? "line-through text-green-700"
                                : "text-gray-800"
                            }`}
                          >
                            {goal.goal_text}
                          </span>
                          {goal.user_name && (
                            <p className="text-xs text-gray-500 mt-1">
                              by {goal.user_name}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add new goal..."
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddGoal()}
                    className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <Button
                    onClick={handleAddGoal}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Shared Notes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6 bg-white shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Shared Notes
                  </h3>
                  <span className="ml-auto text-xs text-gray-500">
                    Real-time sync ✨
                  </span>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full h-64 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors font-mono text-sm resize-none"
                  placeholder="Start taking notes..."
                />
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Participants */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <Card className="p-4 bg-white shadow-xl sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <Users className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Participants ({participants.length})
                </h3>
              </div>

              <div className="space-y-3">
                {participants
                  .sort((a, b) => b.studyTime - a.studyTime) // Sort by study time
                  .map((participant, idx) => {
                    const isTopPerformer = idx === 0; // Highest study time
                    const gradientColors = [
                      "from-purple-100 to-pink-100",
                      "from-orange-100 to-red-100",
                      "from-blue-100 to-cyan-100",
                    ];

                    return (
                      <motion.div
                        key={participant.participant_id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all shadow-sm ${
                          isTopPerformer
                            ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 shadow-yellow-200 ring-2 ring-yellow-200"
                            : `bg-gradient-to-r ${
                                gradientColors[idx % gradientColors.length]
                              } border-gray-200 hover:shadow-md`
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-md ${
                            isTopPerformer
                              ? "bg-gradient-to-br from-yellow-400 to-orange-500 ring-2 ring-yellow-300"
                              : "bg-gradient-to-br from-indigo-500 to-purple-500"
                          }`}
                        >
                          {participant.display_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">
                              {participant.display_name}
                            </p>
                            {isTopPerformer && (
                              <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold rounded-full">
                                👑 Top
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2.5 h-2.5 rounded-full ${
                                participant.status === "active"
                                  ? "bg-green-500 animate-pulse"
                                  : participant.status === "break"
                                  ? "bg-yellow-500"
                                  : "bg-gray-400"
                              }`}
                            />
                            <span className="text-sm font-medium text-gray-700">
                              {participant.study_time} mins
                            </span>
                            <span className="text-xs text-gray-500 capitalize">
                              {participant.status}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
              </div>

              <Dialog
                open={showInviteDialog}
                onOpenChange={setShowInviteDialog}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full mt-6 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                  >
                    <Plus className="mr-2 w-4 h-4" />
                    Invite Friends
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Mời bạn bè tham gia</DialogTitle>
                    <DialogDescription>
                      Chia sẻ mã phòng hoặc link để mời bạn bè
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Mã phòng
                      </label>
                      <div className="flex gap-2">
                        <Input
                          value={roomData?.room_code || ""}
                          readOnly
                          className="flex-1 font-mono"
                        />
                        <Button
                          onClick={handleCopyRoomCode}
                          variant="outline"
                          size="icon"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Link mời
                      </label>
                      <div className="flex gap-2">
                        <Input
                          value={
                            roomData
                              ? `${window.location.origin}/study-room?room=${roomData.room_code}`
                              : ""
                          }
                          readOnly
                          className="flex-1 text-xs"
                        />
                        <Button
                          onClick={handleCopyInviteLink}
                          variant="outline"
                          size="icon"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Add Friend by Email */}
                    <div className="border-t pt-4 mt-4">
                      <label className="text-sm font-medium mb-2 block">
                        Thêm bạn bè mới
                      </label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Nhập email của bạn"
                          value={friendEmail}
                          onChange={(e) => setFriendEmail(e.target.value)}
                          className="flex-1"
                        />
                        <Button onClick={handleAddFriend} variant="outline">
                          <Plus className="w-4 h-4 mr-2" />
                          Gửi
                        </Button>
                      </div>
                    </div>

                    {/* Friends List */}
                    <div className="border-t pt-4 mt-4">
                      <label className="text-sm font-medium mb-3 block">
                        Danh sách bạn bè ({friends.length})
                      </label>
                      {friends.length === 0 ? (
                        <p className="text-gray-500 text-center py-4 text-sm">
                          Chưa có bạn bè
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {friends.map((friend) => (
                            <div
                              key={friend.user_id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                  {friend.full_name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 text-sm">
                                    {friend.full_name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {friend.email}
                                  </p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleInviteFriend(friend.user_id)
                                }
                                className="bg-gradient-to-r from-indigo-500 to-purple-500"
                              >
                                <Share2 className="w-4 h-4 mr-1" />
                                Mời
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => {
                          handleCopyInviteLink();
                          setShowInviteDialog(false);
                        }}
                        className="flex-1"
                      >
                        <Share2 className="mr-2 w-4 h-4" />
                        Copy Link
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
