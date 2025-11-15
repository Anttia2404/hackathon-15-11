import { Calendar, Sparkles, GraduationCap } from "lucide-react";

export type TabType = "context" | "generator";

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">AcademicAI</h2>
            <p className="text-slate-500 text-sm">Smart Planner</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-2">
          <button
            onClick={() => onTabChange("context")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === "context"
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="font-medium">Fixed Schedule</span>
          </button>

          <button
            onClick={() => onTabChange("generator")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === "generator"
                ? "bg-violet-50 text-violet-700"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">AI Scheduler</span>
          </button>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-200">
        <div className="bg-gradient-to-br from-blue-50 to-violet-50 rounded-xl p-4">
          <p className="text-slate-700 text-sm font-medium mb-1">💡 Pro Tip</p>
          <p className="text-slate-600 text-xs">
            Import your timetable first, then let AI optimize your study
            schedule!
          </p>
        </div>
      </div>
    </aside>
  );
}
