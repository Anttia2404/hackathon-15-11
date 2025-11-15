import { useState, useEffect } from "react";
import { DeadlineForm } from "./DeadlineForm";
import { LifestyleSettings } from "./LifestyleSettings";
import { StudyModeSelector } from "./StudyModeSelector";
import { StudyPlanCalendar } from "./StudyPlanCalendar";
import { Button } from "../ui/button";
import { Sparkles } from "lucide-react";
import { generateAISchedule } from "../../utils/aiScheduler";
import { api } from "../../services/api";

export interface Deadline {
  id: string;
  title: string;
  dueDate: string;
  estimatedHours: number;
  details: string;
  type?: "flexible" | "fixed"; // flexible = tự học, fixed = kiểm tra/thi (rơi vào TKB)
  fixedTime?: string; // Giờ cố định nếu type = 'fixed'
}

export interface LifestylePrefs {
  sleepHours: number;
  lunchDuration: number;
  dinnerDuration: number;
}

export type StudyMode = "relaxed" | "normal" | "sprint";

interface ScheduleGeneratorTabProps {
  timetableData: any[];
  hardLimits: {
    noAfter23: boolean;
    noSundays: boolean;
  };
  scheduleWeeks: number;
  generatedPlan: any;
  setGeneratedPlan: (plan: any) => void;
}

export function ScheduleGeneratorTab({
  timetableData,
  hardLimits,
  scheduleWeeks,
  generatedPlan,
  setGeneratedPlan,
}: ScheduleGeneratorTabProps) {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [lifestyle, setLifestyle] = useState<LifestylePrefs>({
    sleepHours: 7,
    lunchDuration: 45,
    dinnerDuration: 45,
  });
  const [studyMode, setStudyMode] = useState<StudyMode>("normal");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Load deadlines, preferences, and last generated plan on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingData(true);

        // Load deadlines (only pending and future ones)
        const deadlinesRes = await api.deadlines.load();
        if (deadlinesRes.success && deadlinesRes.deadlines) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          // Filter: chỉ lấy deadline chưa hoàn thành và chưa quá hạn
          const activeDeadlines = deadlinesRes.deadlines.filter((d: any) => {
            const dueDate = new Date(d.dueDate);
            return dueDate >= today; // Chỉ lấy deadline từ hôm nay trở đi
          });

          setDeadlines(activeDeadlines);
        }

        // Load preferences
        const prefsRes = await api.preferences.load();
        if (prefsRes.success && prefsRes.preferences) {
          setLifestyle({
            sleepHours: prefsRes.preferences.sleepHours || 7,
            lunchDuration: prefsRes.preferences.lunchDuration || 45,
            dinnerDuration: prefsRes.preferences.dinnerDuration || 45,
          });
          setStudyMode(prefsRes.preferences.studyMode || "normal");
        }

        // Load last generated plan (if exists) - only if not already loaded
        console.log("🔍 Checking if should load plans from DB...");
        console.log("   generatedPlan:", generatedPlan ? "exists" : "null");
        console.log("   scheduleWeeks:", scheduleWeeks);

        if (!generatedPlan) {
          const today = new Date().toISOString().split("T")[0];
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + scheduleWeeks * 7);

          console.log("📡 Calling API to load plans...");
          console.log(
            "   Date range:",
            today,
            "to",
            endDate.toISOString().split("T")[0]
          );

          const plansRes = await api.studyPlans.load(
            undefined,
            today,
            endDate.toISOString().split("T")[0]
          );
          console.log("📦 API response:", plansRes);
          console.log(
            "📦 Plans data:",
            JSON.stringify(plansRes.plans, null, 2)
          );

          if (plansRes.success && plansRes.plans && plansRes.plans.length > 0) {
            console.log(
              "📥 Loading plans from DB:",
              plansRes.plans.length,
              "days"
            );

            // Group plans by week
            const weekMap = new Map();

            plansRes.plans.forEach((plan: any) => {
              const planDate = new Date(plan.plan_date);
              const dayName = [
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
              ][planDate.getDay()];

              // Find which week this belongs to
              const weekStart = new Date(planDate);
              weekStart.setDate(planDate.getDate() - planDate.getDay()); // Start of week (Sunday)
              const weekKey = weekStart.toISOString().split("T")[0];

              if (!weekMap.has(weekKey)) {
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                weekMap.set(weekKey, {
                  weekNumber: weekMap.size + 1,
                  startDate: weekKey,
                  endDate: weekEnd.toISOString().split("T")[0],
                  days: {
                    Sunday: [],
                    Monday: [],
                    Tuesday: [],
                    Wednesday: [],
                    Thursday: [],
                    Friday: [],
                    Saturday: [],
                  },
                });
              }

              // Add tasks to the correct day - filter out null/invalid tasks
              const week = weekMap.get(weekKey);
              const validTasks = (plan.tasks || [])
                .filter((t: any) => {
                  if (!t || !t.taskName || !t.startTime || !t.endTime) {
                    console.warn("Skipping invalid task:", t);
                    return false;
                  }
                  // Check for valid time format
                  if (
                    !/^\d{2}:\d{2}$/.test(t.startTime) ||
                    !/^\d{2}:\d{2}$/.test(t.endTime)
                  ) {
                    console.warn("Skipping task with invalid time format:", t);
                    return false;
                  }
                  return true;
                })
                .map((t: any) => ({
                  time: `${t.startTime} - ${t.endTime}`,
                  activity: t.taskName,
                  category: t.category || "study",
                  priority: "medium",
                }));

              console.log(
                `📅 ${dayName} (${plan.plan_date}): ${validTasks.length} task(s)`
              );

              // Replace (not append) - each plan_date should have its own tasks
              week.days[dayName] = validTasks;
            });

            const weeks = Array.from(weekMap.values());

            setGeneratedPlan({
              weeks,
              summary: plansRes.plans[0]?.summary || "Loaded from database",
              workloadAnalysis: {
                score: 5,
                warning: "Loaded from database",
                strategy: "Continue with your plan",
              },
            });
            console.log("✅ Loaded", weeks.length, "week(s) from database");
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, [scheduleWeeks, generatedPlan, setGeneratedPlan]);

  const handleGeneratePlan = async () => {
    // Check if there are new deadlines
    const processedDeadlineIds =
      generatedPlan?.metadata?.processedDeadlineIds || [];
    const newDeadlines = deadlines.filter(
      (d) => !processedDeadlineIds.includes(d.id)
    );

    if (newDeadlines.length === 0) {
      alert(
        "⚠️ Không có deadline mới!\n\nTất cả deadlines đã được phân tích. Thêm deadline mới hoặc xóa lịch hiện tại để generate lại."
      );
      return;
    }

    setIsGenerating(true);

    try {
      const plan = await generateAISchedule({
        deadlines: newDeadlines, // Chỉ gửi deadline mới
        lifestyle,
        studyMode,
        timetableData,
        hardLimits,
        scheduleWeeks,
      });

      // Track processed deadlines
      plan.metadata = {
        ...plan.metadata,
        processedDeadlineIds: [
          ...processedDeadlineIds,
          ...newDeadlines.map((d) => d.id),
        ],
      };

      // Don't merge - just set the new plan
      // The database will handle merging when we save
      setGeneratedPlan(plan);

      // Auto-save plan to database
      if (plan.weeks && plan.weeks.length > 0) {
        for (const week of plan.weeks) {
          const weekStart = new Date(week.startDate);

          // Save each day separately
          const dayNames = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ];

          for (let dayIndex = 0; dayIndex < dayNames.length; dayIndex++) {
            const dayName = dayNames[dayIndex];
            const dayTasks = week.days[dayName];

            if (!Array.isArray(dayTasks) || dayTasks.length === 0) {
              continue; // Skip days with no tasks
            }

            // Calculate the actual date for this day
            const dayDate = new Date(weekStart);
            dayDate.setDate(weekStart.getDate() + dayIndex);
            const planDate = dayDate.toISOString().split("T")[0];

            const tasks: any[] = [];

            dayTasks.forEach((task: any) => {
              // Skip if task doesn't have required fields
              if (!task.task && !task.activity) {
                console.warn("Skipping task without name:", task);
                return;
              }

              // Parse duration to minutes
              let durationMinutes = 60; // default
              if (task.duration) {
                if (typeof task.duration === "number") {
                  durationMinutes = task.duration;
                } else if (typeof task.duration === "string") {
                  // Parse "1.0 hours", "60 min", etc.
                  const match = task.duration.match(/(\d+\.?\d*)/);
                  if (match) {
                    const num = parseFloat(match[1]);
                    if (task.duration.includes("hour")) {
                      durationMinutes = Math.round(num * 60);
                    } else {
                      durationMinutes = Math.round(num);
                    }
                  }
                }
              }

              // Calculate duration from time range if not provided
              if (!task.duration && (task.timeRange || task.time)) {
                const timeStr = task.timeRange || task.time;
                if (timeStr && timeStr.includes(" - ")) {
                  const [start, end] = timeStr.split(" - ");
                  const [startH, startM] = start.split(":").map(Number);
                  const [endH, endM] = end.split(":").map(Number);
                  durationMinutes = endH * 60 + endM - (startH * 60 + startM);
                }
              }

              tasks.push({
                taskName: task.task || task.activity,
                startTime:
                  task.timeRange?.split(" - ")[0] || task.time?.split(" - ")[0],
                endTime:
                  task.timeRange?.split(" - ")[1] || task.time?.split(" - ")[1],
                duration: durationMinutes,
                category: task.category || "study",
              });
            });

            // Save this day's plan to DB (will replace if exists)
            if (tasks.length > 0) {
              await api.studyPlans
                .save({
                  planDate,
                  studyMode,
                  summary: plan.summary,
                  tasks,
                })
                .catch((err) =>
                  console.error(`Failed to save plan for ${planDate}:`, err)
                );
              console.log(`✅ Saved ${tasks.length} task(s) for ${planDate}`);
            }
          }
        }
        console.log("✅ All AI plans saved to database");
      }
    } catch (error) {
      console.error("Failed to generate plan:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const addDeadline = async (deadline: Omit<Deadline, "id">) => {
    try {
      // Save to database
      const response = await api.deadlines.save(deadline);
      if (response.success && response.deadline) {
        setDeadlines([...deadlines, response.deadline]);
      }
    } catch (error) {
      console.error("Failed to save deadline:", error);
      // Fallback to local state
      const newDeadline = {
        ...deadline,
        id: Date.now().toString(),
      };
      setDeadlines([...deadlines, newDeadline]);
    }
  };

  const removeDeadline = async (id: string) => {
    try {
      // Delete from database
      await api.deadlines.delete(id);
      setDeadlines(deadlines.filter((d) => d.id !== id));
    } catch (error) {
      console.error("Failed to delete deadline:", error);
      // Still remove from local state
      setDeadlines(deadlines.filter((d) => d.id !== id));
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your deadlines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-4">
      {/* Left Section - Input Controls */}
      <div className="space-y-4">
        <DeadlineForm
          deadlines={deadlines}
          onAddDeadline={addDeadline}
          onRemoveDeadline={removeDeadline}
        />

        <LifestyleSettings
          lifestyle={lifestyle}
          onLifestyleChange={(newLifestyle) => {
            setLifestyle(newLifestyle);
            // Auto-save preferences
            api.preferences
              .save({
                sleepHours: newLifestyle.sleepHours,
                lunchDuration: newLifestyle.lunchDuration,
                dinnerDuration: newLifestyle.dinnerDuration,
                studyMode,
              })
              .catch((err) =>
                console.error("Failed to save preferences:", err)
              );
          }}
          studyMode={studyMode}
        />

        <StudyModeSelector
          studyMode={studyMode}
          onStudyModeChange={(newMode) => {
            setStudyMode(newMode);
            // Auto-save preferences
            api.preferences
              .save({
                sleepHours: lifestyle.sleepHours,
                lunchDuration: lifestyle.lunchDuration,
                dinnerDuration: lifestyle.dinnerDuration,
                studyMode: newMode,
              })
              .catch((err) =>
                console.error("Failed to save preferences:", err)
              );
          }}
          onLifestyleUpdate={setLifestyle}
        />

        <Button
          onClick={handleGeneratePlan}
          disabled={deadlines.length === 0 || isGenerating}
          className="w-full h-14 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700"
          size="lg"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          {isGenerating
            ? "Generating AI Study Plan..."
            : "Generate AI Study Plan"}
        </Button>
        {deadlines.length === 0 && (
          <p className="text-slate-500 text-sm text-center">
            Add at least one deadline to generate a study plan
          </p>
        )}
      </div>

      {/* Right Section - AI Results */}
      <div className="lg:sticky lg:top-8 lg:self-start">
        {isGenerating ? (
          <div className="bg-white rounded-xl shadow-lg p-4 border border-violet-200">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-5 h-5 text-violet-600 animate-pulse" />
              <h3 className="text-lg font-bold text-slate-900">
                Generating Your Plan...
              </h3>
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-slate-100 rounded-lg animate-pulse"
                />
              ))}
            </div>
          </div>
        ) : generatedPlan ? (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button
                onClick={async () => {
                  if (
                    confirm(
                      "Xóa toàn bộ lịch AI? Các deadline sẽ trở về trạng thái chưa phân tích và có thể generate lại."
                    )
                  ) {
                    try {
                      // Delete all study plans from database
                      await api.studyPlans.deleteAll();

                      // Reset generated plan (this will reset processedDeadlineIds)
                      setGeneratedPlan(null);
                      console.log(
                        "✅ Toàn bộ lịch AI đã được xóa. Deadlines có thể được phân tích lại."
                      );
                    } catch (error) {
                      console.error("Error deleting plans:", error);
                      // Still clear local state
                      setGeneratedPlan(null);
                    }
                  }
                }}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                🗑️ Xóa toàn bộ lịch AI
              </Button>
            </div>
            <StudyPlanCalendar plan={generatedPlan} />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-4 border border-slate-200">
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-violet-100 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-violet-600" />
              </div>
              <p className="text-slate-600">
                Configure your deadlines and preferences, then generate your
                personalized study plan
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
