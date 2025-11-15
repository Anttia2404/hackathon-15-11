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

interface Participant {
  id: string;
  name: string;
  avatar: string;
  status: "active" | "break" | "away";
  studyTime: number;
}

interface StudyGoal {
  id: string;
  text: string;
  completed: boolean;
  userId: string;
}

export function StudyRoom() {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [joinRoomId, setJoinRoomId] = useState("");
  const [isInRoom, setIsInRoom] = useState(false);
  const [userName, setUserName] = useState("");
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Pomodoro Timer
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useState(0);
  
  // Feature tabs
  const [activeTab, setActiveTab] = useState<"timer" | "whiteboard" | "code" | "video">("timer");
  
  // Participants (Mock data)
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: "1",
      name: "Bạn",
      avatar: "👤",
      status: "active",
      studyTime: 45,
    },
    {
      id: "2",
      name: "Nguyễn Văn A",
      avatar: "👨",
      status: "active",
      studyTime: 38,
    },
    {
      id: "3",
      name: "Trần Thị B",
      avatar: "👩",
      status: "break",
      studyTime: 42,
    },
  ]);
  
  // Study Goals
  const [goals, setGoals] = useState<StudyGoal[]>([
    { id: "1", text: "Hoàn thành bài tập Machine Learning", completed: false, userId: "1" },
    { id: "2", text: "Đọc chapter 5 - Neural Networks", completed: true, userId: "1" },
  ]);
  const [newGoal, setNewGoal] = useState("");
  
  // Shared Notes
  const [notes, setNotes] = useState("# Study Notes\n\n- Topic: Machine Learning\n- Focus: Neural Networks\n");

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
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCreateRoom = () => {
    if (!userName.trim()) {
      toast.error("Vui lòng nhập tên của bạn");
      return;
    }
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(newRoomId);
    setIsInRoom(true);
    toast.success(`Đã tạo phòng ${newRoomId}!`);
  };

  const handleJoinRoom = () => {
    if (!userName.trim()) {
      toast.error("Vui lòng nhập tên của bạn");
      return;
    }
    if (!joinRoomId.trim()) {
      toast.error("Vui lòng nhập mã phòng");
      return;
    }
    setRoomId(joinRoomId.trim().toUpperCase());
    setIsInRoom(true);
    toast.success(`Đã tham gia phòng ${joinRoomId.toUpperCase()}!`);
  };

  const handleCopyRoomCode = async () => {
    if (!roomId) return;
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      toast.success("Đã copy mã phòng!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Không thể copy mã phòng");
    }
  };

  const handleCopyInviteLink = async () => {
    if (!roomId) return;
    const inviteLink = `${window.location.origin}/study-room?room=${roomId}`;
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success("Đã copy link mời!");
    } catch (err) {
      toast.error("Không thể copy link");
    }
  };

  const handleAddGoal = () => {
    if (newGoal.trim()) {
      setGoals([
        ...goals,
        {
          id: Date.now().toString(),
          text: newGoal,
          completed: false,
          userId: "1",
        },
      ]);
      setNewGoal("");
    }
  };

  const toggleGoal = (id: string) => {
    setGoals(goals.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g)));
  };

  if (!isInRoom) {
    // Landing Page - Create/Join Room
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            {/* Header */}
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
              >
                <Users className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Study Room
                </span>
              </h1>
              <p className="text-gray-600 text-lg">
                Học nhóm online với Pomodoro timer, shared notes và goals tracking 🚀
              </p>
            </div>

            {/* Create/Join Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Create Room */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-8 hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-indigo-200 bg-gradient-to-br from-white to-indigo-50/30">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <Plus className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Tạo Study Room
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    Tạo phòng học mới và mời bạn bè cùng học
                  </p>
                  <Input
                    type="text"
                    placeholder="Tên của bạn"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full mb-4"
                    onKeyPress={(e) => e.key === "Enter" && handleCreateRoom()}
                  />
                  <Button
                    onClick={handleCreateRoom}
                    disabled={!userName.trim()}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Plus className="mr-2 w-5 h-5" />
                    Tạo phòng mới
                  </Button>
                </Card>
              </motion.div>

              {/* Join Room */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-8 hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-purple-200 bg-gradient-to-br from-white to-purple-50/30">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Tham gia phòng
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    Nhập tên và mã phòng để tham gia
                  </p>
                  <input
                    type="text"
                    placeholder="Tên của bạn"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl mb-3 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                  <Input
                    type="text"
                    placeholder="Mã phòng (VD: ABC123)"
                    value={joinRoomId}
                    onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                    className="w-full mb-4"
                    onKeyPress={(e) => e.key === "Enter" && handleJoinRoom()}
                  />
                  <Button
                    onClick={handleJoinRoom}
                    disabled={!userName.trim()}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Users className="mr-2 w-5 h-5" />
                    Tham gia
                  </Button>
                </Card>
              </motion.div>
            </div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {[
                { icon: Clock, label: "Pomodoro Timer", color: "from-blue-500 to-cyan-500" },
                { icon: Target, label: "Study Goals", color: "from-green-500 to-emerald-500" },
                { icon: BookOpen, label: "Shared Notes", color: "from-orange-500 to-red-500" },
                { icon: Sparkles, label: "Real-time Sync", color: "from-purple-500 to-pink-500" },
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className="text-center p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mx-auto mb-2 shadow-md`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">{feature.label}</p>
                </div>
              ))}
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
                  <span className="text-sm text-gray-600">Room ID: {roomId}</span>
                  <button
                    onClick={handleCopyRoomCode}
                    className="text-indigo-600 hover:text-indigo-700 transition-colors"
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
            <Button
              variant="outline"
              onClick={() => setIsInRoom(false)}
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <LogOut className="mr-2 w-4 h-4" />
              Rời phòng
            </Button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Features */}
          <div className="lg:col-span-2 space-y-6">
            {/* Feature Tabs */}
            <Card className="p-6 bg-white shadow-xl rounded-2xl border border-gray-100">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
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
                <TabsContent value="timer" className="space-y-6 mt-0">
                  {/* Pomodoro Timer */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Card className="p-8 bg-gradient-to-br from-white to-indigo-50/50 border-2 border-indigo-100 rounded-xl">
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
                        strokeDashoffset={`${2 * Math.PI * 120 * (1 - timeLeft / (isBreak ? 300 : 1500))}`}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
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
                      <span className="font-semibold text-indigo-600">{sessions}</span>
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
                  {roomId ? (
                    <VideoCallTab roomId={roomId} participants={participants} />
                  ) : (
                    <div className="p-8 bg-gradient-to-br from-white to-blue-50/50 border-2 border-blue-100 rounded-xl text-center">
                      <Video className="w-16 h-16 mx-auto mb-4 text-blue-600" />
                      <h3 className="text-xl font-semibold mb-2">Video Call</h3>
                      <p className="text-gray-600 mb-6">Vui lòng tạo hoặc tham gia phòng để sử dụng Video Call</p>
                    </div>
                  )}
                </TabsContent>

                {/* Whiteboard Tab */}
                <TabsContent value="whiteboard" className="space-y-6 mt-0">
                  {roomId ? (
                    <WhiteboardTab roomId={roomId} />
                  ) : (
                    <div className="p-8 bg-gradient-to-br from-white to-purple-50/50 border-2 border-purple-100 rounded-xl text-center">
                      <PenTool className="w-16 h-16 mx-auto mb-4 text-purple-600" />
                      <h3 className="text-xl font-semibold mb-2">Whiteboard</h3>
                      <p className="text-gray-600 mb-6">Vui lòng tạo hoặc tham gia phòng để sử dụng Whiteboard</p>
                    </div>
                  )}
                </TabsContent>

                {/* Code Tab */}
                <TabsContent value="code" className="space-y-6 mt-0">
                  {roomId ? (
                    <CodeEditorTab roomId={roomId} />
                  ) : (
                    <div className="p-8 bg-gradient-to-br from-white to-green-50/50 border-2 border-green-100 rounded-xl text-center">
                      <Code className="w-16 h-16 mx-auto mb-4 text-green-600" />
                      <h3 className="text-xl font-semibold mb-2">Code Editor</h3>
                      <p className="text-gray-600 mb-6">Vui lòng tạo hoặc tham gia phòng để sử dụng Code Editor</p>
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
                  <Target className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Study Goals</h3>
                </div>

                <div className="space-y-3 mb-4">
                  <AnimatePresence>
                    {goals.map((goal) => (
                      <motion.div
                        key={goal.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                          goal.completed
                            ? "bg-green-50 border-green-200"
                            : "bg-gray-50 border-gray-200 hover:border-indigo-200"
                        }`}
                      >
                        <button
                          onClick={() => toggleGoal(goal.id)}
                          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                            goal.completed
                              ? "bg-green-500 border-green-500"
                              : "border-gray-300 hover:border-indigo-500"
                          }`}
                        >
                          {goal.completed && <Check className="w-4 h-4 text-white" />}
                        </button>
                        <span
                          className={`flex-1 ${
                            goal.completed
                              ? "line-through text-gray-500"
                              : "text-gray-700"
                          }`}
                        >
                          {goal.text}
                        </span>
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
                  <BookOpen className="w-5 h-5 text-orange-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Shared Notes</h3>
                  <span className="ml-auto text-xs text-gray-500">Real-time sync ✨</span>
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
            <Card className="p-6 bg-white shadow-xl sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <Users className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Participants ({participants.length})
                </h3>
              </div>

              <div className="space-y-3">
                {participants.map((participant, idx) => (
                  <motion.div
                    key={participant.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-2xl shadow-md">
                      {participant.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{participant.name}</p>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            participant.status === "active"
                              ? "bg-green-500"
                              : participant.status === "break"
                              ? "bg-yellow-500"
                              : "bg-gray-400"
                          }`}
                        />
                        <span className="text-xs text-gray-600">
                          {participant.studyTime} mins
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
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
                      <label className="text-sm font-medium mb-2 block">Mã phòng</label>
                      <div className="flex gap-2">
                        <Input value={roomId || ""} readOnly className="flex-1 font-mono" />
                        <Button onClick={handleCopyRoomCode} variant="outline" size="icon">
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Link mời</label>
                      <div className="flex gap-2">
                        <Input
                          value={roomId ? `${window.location.origin}/study-room?room=${roomId}` : ""}
                          readOnly
                          className="flex-1 text-xs"
                        />
                        <Button onClick={handleCopyInviteLink} variant="outline" size="icon">
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
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
