import { motion } from "framer-motion";
import {
  Users,
  GraduationCap,
  BookOpen,
  School,
  UserCheck,
} from "lucide-react";
import { Card } from "../ui/card";

interface StatisticsCardsProps {
  stats: any;
}

export default function StatisticsCards({ stats }: StatisticsCardsProps) {
  const cards = [
    {
      title: "Tổng số lớp học",
      value: stats?.total_classes || 0,
      icon: School,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Giảng viên",
      value: stats?.total_teachers || 0,
      icon: GraduationCap,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Sinh viên",
      value: stats?.total_students || 0,
      icon: Users,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Môn học",
      value: stats?.total_courses || 0,
      icon: BookOpen,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Đăng ký học",
      value: stats?.total_enrollments || 0,
      icon: UserCheck,
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4 hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-r ${card.color} flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">
                {card.title}
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                {card.value.toLocaleString()}
              </p>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
