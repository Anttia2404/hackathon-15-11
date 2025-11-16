import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GraduationCap, TrendingUp, School } from "lucide-react";
import adminService from "../../services/adminService";
import ClassManagement from "./ClassManagement.tsx";
import StatisticsCards from "./StatisticsCards.tsx";

export function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await adminService.getDashboard();
      setStats(data.statistics);
    } catch (error) {
      console.error("Load dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "overview", label: "Tổng quan", icon: TrendingUp },
    { id: "classes", label: "Quản lý lớp học", icon: School },
    { id: "teachers", label: "Quản lý giảng viên", icon: GraduationCap },
  ];

  return (
    <div className="min-h-screen w-full relative bg-white py-8">
      {/* Purple Glow Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `radial-gradient(circle at top right, rgba(173, 109, 244, 0.5), transparent 70%)`,
          filter: "blur(80px)",
        }}
      />
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `radial-gradient(circle at bottom left, rgba(99, 102, 241, 0.3), transparent 60%)`,
          filter: "blur(80px)",
        }}
      />

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Quản lý toàn bộ hệ thống giáo dục
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 font-medium transition-all relative ${
                    activeTab === tab.id
                      ? "text-indigo-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : (
          <>
            {activeTab === "overview" && <StatisticsCards stats={stats} />}
            {activeTab === "classes" && <ClassManagement />}
            {activeTab === "teachers" && (
              <div className="text-center py-12 text-gray-500">
                Chức năng quản lý giảng viên đang được phát triển
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
