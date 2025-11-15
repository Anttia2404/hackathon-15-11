import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bell, X, Clock, BookOpen } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  icon: "clock" | "book";
  type: "reminder" | "insight";
}

interface PushNotificationProps {
  onClose?: () => void;
  notifications?: any[]; // Accept notifications from parent
}

export function PushNotification({ onClose, notifications: externalNotifications }: PushNotificationProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    // If external notifications provided, use them
    if (externalNotifications && externalNotifications.length > 0) {
      const formattedNotifications = externalNotifications.map((notif, index) => ({
        id: notif.id || index,
        title: "📢 Thông báo từ giảng viên",
        message: notif.message,
        time: new Date(notif.timestamp || notif.created_at).toLocaleString('vi-VN'),
        icon: "book" as const,
        type: "reminder" as const
      }));
      setNotifications(formattedNotifications);
      return;
    }

    // Otherwise use mock notifications (for demo)
    const mockNotifications: Notification[] = [
      {
        id: 1,
        title: "⏰ Giờ học tối ưu!",
        message: "19:00 – Ôn Toán – Bạn hay học hiệu quả nhất vào giờ này!",
        time: "Vừa xong",
        icon: "clock",
        type: "reminder"
      }
    ];

    setNotifications(mockNotifications);
  }, [externalNotifications]);

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const latestNotification = notifications[notifications.length - 1];

  // If onClose is provided, render as dropdown (from Navigation)
  if (onClose) {
    return (
      <Card className="w-96 max-h-[500px] overflow-hidden shadow-2xl border border-gray-200">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Thông báo</h3>
            {notifications.length > 0 && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                {notifications.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[440px]">
          {notifications.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Bell className="w-16 h-16 mx-auto mb-3 text-gray-300" />
              <p className="font-medium text-gray-700">Chưa có thông báo</p>
              <p className="text-sm mt-1">Tin nhắn từ giảng viên sẽ hiển thị ở đây</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notif) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 hover:bg-blue-50 transition-colors group"
                >
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">
                        {notif.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {notif.message}
                      </p>
                      <span className="text-xs text-gray-500">
                        {notif.time}
                      </span>
                    </div>
                    <button
                      onClick={() => removeNotification(notif.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded-full transition-all flex-shrink-0"
                    >
                      <X className="w-4 h-4 text-gray-400 hover:text-red-600" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </Card>
    );
  }

  // Original floating notification behavior (for standalone use)
  return (
    <>
      {/* Latest Notification Popup */}
      <AnimatePresence>
        {latestNotification && !showAll && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: 100 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20, x: 100 }}
            className="fixed top-6 right-6 z-50"
          >
            <Card className="w-96 p-4 shadow-2xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  latestNotification.icon === "clock" 
                    ? "bg-blue-500" 
                    : "bg-purple-500"
                }`}>
                  {latestNotification.icon === "clock" ? (
                    <Clock className="w-5 h-5 text-white" />
                  ) : (
                    <BookOpen className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-medium text-gray-900">{latestNotification.title}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeNotification(latestNotification.id)}
                      className="h-6 w-6 p-0 -mt-1"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{latestNotification.message}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{latestNotification.time}</span>
                    {notifications.length > 1 && (
                      <button
                        onClick={() => setShowAll(true)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Xem tất cả ({notifications.length})
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* All Notifications Panel */}
      <AnimatePresence>
        {showAll && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-6 right-6 z-50"
          >
            <Card className="w-96 max-h-[500px] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-blue-600" />
                  <h3 className="font-medium text-gray-900">Thông báo ({notifications.length})</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAll(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-2">
                {notifications.map((notif) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 hover:bg-gray-50 rounded-lg mb-2 border border-gray-100"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        notif.icon === "clock" 
                          ? "bg-blue-100" 
                          : "bg-purple-100"
                      }`}>
                        {notif.icon === "clock" ? (
                          <Clock className="w-4 h-4 text-blue-600" />
                        ) : (
                          <BookOpen className="w-4 h-4 text-purple-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 mb-1">{notif.title}</h4>
                        <p className="text-sm text-gray-600 mb-1">{notif.message}</p>
                        <span className="text-xs text-gray-500">{notif.time}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeNotification(notif.id)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Bell Icon */}
      {!showAll && notifications.length > 0 && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setShowAll(true)}
          className="fixed top-6 right-20 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-40 border-2 border-blue-200"
        >
          <Bell className="w-5 h-5 text-blue-600" />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {notifications.length}
            </span>
          )}
        </motion.button>
      )}
    </>
  );
}
