import { useState, useEffect } from "react";
import { ContextTab } from "./ContextTab";
import { ScheduleGeneratorTab } from "./ScheduleGeneratorTab";
import { api } from "../../services/api";

export type TabType = "context" | "generator";

export function SmartScheduler() {
  const [activeTab, setActiveTab] = useState<TabType>("context");
  const [timetableData, setTimetableData] = useState<any[]>([]);
  const [hardLimits, setHardLimits] = useState({
    noAfter23: false,
    noSundays: false,
  });
  const [scheduleWeeks, setScheduleWeeks] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Load timetable
        const timetableRes = await api.timetable.load();
        if (timetableRes.success && timetableRes.timetable) {
          setTimetableData(timetableRes.timetable);
        }

        // Load preferences
        const prefsRes = await api.preferences.load();
        if (prefsRes.success && prefsRes.preferences) {
          setHardLimits({
            noAfter23: prefsRes.preferences.noAfter23 || false,
            noSundays: prefsRes.preferences.noSundays || false,
          });
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🎓</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  AI Academic Advisor & Smart Scheduler
                </h1>
                <p className="text-sm text-slate-600">
                  Your intelligent assistant for optimizing study schedules
                </p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("context")}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "context"
                  ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span className="text-xl">📅</span>
              Fixed Schedule
            </button>
            <button
              onClick={() => setActiveTab("generator")}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "generator"
                  ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span className="text-xl">✨</span>
              AI Scheduler
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-7xl mx-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading your data...</p>
            </div>
          </div>
        ) : (
          <div className="min-h-[calc(100vh-200px)]">
            {activeTab === "context" && (
              <ContextTab
                timetableData={timetableData}
                setTimetableData={(data) => {
                  setTimetableData(data);
                  // Extract weeks from first slot
                  if (data.length > 0 && data[0].weeks) {
                    setScheduleWeeks(data[0].weeks);
                  }
                  // Auto-save to database
                  api.timetable
                    .save(data)
                    .catch((err) =>
                      console.error("Failed to save timetable:", err)
                    );
                }}
              />
            )}

            {activeTab === "generator" && (
              <ScheduleGeneratorTab
                timetableData={timetableData}
                hardLimits={hardLimits}
                scheduleWeeks={scheduleWeeks}
                generatedPlan={generatedPlan}
                setGeneratedPlan={setGeneratedPlan}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
