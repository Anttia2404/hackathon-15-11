import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

const localizer = momentLocalizer(moment);

interface StudyPlanCalendarProps {
  plan: any;
}

const CATEGORY_COLORS = {
  study: {
    bg: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
    border: "#7c3aed",
    text: "white",
  },
  meal: {
    bg: "linear-gradient(135deg, #f59e0b, #d97706)",
    border: "#d97706",
    text: "white",
  },
  sleep: {
    bg: "linear-gradient(135deg, #3b82f6, #2563eb)",
    border: "#2563eb",
    text: "white",
  },
  break: {
    bg: "linear-gradient(135deg, #10b981, #059669)",
    border: "#059669",
    text: "white",
  },
  class: {
    bg: "linear-gradient(135deg, #ec4899, #db2777)",
    border: "#db2777",
    text: "white",
  },
};

const SUBJECT_COLORS = [
  { bg: "linear-gradient(135deg, #10b981, #059669)", border: "#059669" },
  { bg: "linear-gradient(135deg, #3b82f6, #2563eb)", border: "#2563eb" },
  { bg: "linear-gradient(135deg, #8b5cf6, #7c3aed)", border: "#7c3aed" },
  { bg: "linear-gradient(135deg, #f59e0b, #d97706)", border: "#d97706" },
  { bg: "linear-gradient(135deg, #ec4899, #db2777)", border: "#db2777" },
  { bg: "linear-gradient(135deg, #06b6d4, #0891b2)", border: "#0891b2" },
  { bg: "linear-gradient(135deg, #84cc16, #65a30d)", border: "#65a30d" },
  { bg: "linear-gradient(135deg, #f43f5e, #e11d48)", border: "#e11d48" },
  { bg: "linear-gradient(135deg, #a855f7, #9333ea)", border: "#9333ea" },
  { bg: "linear-gradient(135deg, #14b8a6, #0d9488)", border: "#0d9488" },
];

const CATEGORY_ICONS = {
  study: "📚",
  meal: "🍽️",
  sleep: "😴",
  break: "☕",
  class: "🎓",
};

const dayMap: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

export function StudyPlanCalendar({ plan }: StudyPlanCalendarProps) {
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  // Convert plan to calendar events
  const events = useMemo(() => {
    if (!plan?.weeks || plan.weeks.length === 0) return [];

    const currentWeek = plan.weeks[currentWeekIndex];
    if (!currentWeek) return [];

    const allEvents: any[] = [];
    const weekStartDate = moment(currentWeek.startDate);

    Object.entries(currentWeek.days).forEach(
      ([dayName, tasks]: [string, any]) => {
        const dayOfWeek = dayMap[dayName];
        const eventDate = weekStartDate.clone().day(dayOfWeek);

        tasks.forEach((task: any, idx: number) => {
          try {
            // Support both timeRange and time fields
            const timeStr = task.timeRange || task.time;
            if (!timeStr) {
              console.warn("Task missing time:", task);
              return;
            }

            const [startStr, endStr] = timeStr.split(" - ");

            if (!startStr || !endStr) {
              console.warn("Invalid time format:", timeStr);
              return;
            }

            const [startHour, startMin] = startStr
              .trim()
              .split(":")
              .map(Number);
            const [endHour, endMin] = endStr.trim().split(":").map(Number);

            if (isNaN(startHour) || isNaN(endHour)) {
              console.warn("Invalid time values:", startStr, endStr);
              return;
            }

            const start = eventDate
              .clone()
              .hour(startHour)
              .minute(startMin || 0)
              .toDate();
            const end = eventDate
              .clone()
              .hour(endHour)
              .minute(endMin || 0)
              .toDate();

            allEvents.push({
              id: `${dayName}-${idx}`,
              title: task.task || task.activity,
              start,
              end,
              resource: {
                ...task,
                dayName,
              },
            });
          } catch (error) {
            console.warn("Error parsing task:", task, error);
          }
        });
      }
    );

    return allEvents;
  }, [plan, currentWeekIndex]);

  if (!plan?.weeks || plan.weeks.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        No study plan generated yet
      </div>
    );
  }

  const currentWeek = plan.weeks[currentWeekIndex];

  return (
    <>
      <div className="space-y-4">
        {/* Week Navigation */}
        <div className="flex items-center justify-between bg-gradient-to-r from-violet-50 to-blue-50 rounded-lg p-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Week {currentWeek.weekNumber}
            </h3>
            <p className="text-sm text-slate-600">
              {currentWeek.startDate} - {currentWeek.endDate}
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentWeekIndex(Math.max(0, currentWeekIndex - 1))
              }
              disabled={currentWeekIndex === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Badge className="bg-violet-100 text-violet-700 border-violet-300 px-3">
              {currentWeekIndex + 1} / {plan.weeks.length}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentWeekIndex(
                  Math.min(plan.weeks.length - 1, currentWeekIndex + 1)
                )
              }
              disabled={currentWeekIndex === plan.weeks.length - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Calendar */}
        <div className="h-[600px] bg-gradient-to-br from-slate-50 to-violet-50 rounded-xl shadow-lg p-4">
          <style>{`
            .rbc-calendar {
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .rbc-toolbar {
              padding: 16px 20px;
              background: linear-gradient(to right, #f8fafc, #f1f5f9);
              border-bottom: 2px solid #e2e8f0;
              margin-bottom: 0;
            }
            .rbc-toolbar button {
              padding: 8px 16px;
              border-radius: 8px;
              border: 1px solid #cbd5e1;
              background: white;
              font-size: 14px;
              font-weight: 500;
              transition: all 0.2s;
              box-shadow: 0 1px 2px rgba(0,0,0,0.05);
            }
            .rbc-toolbar button:hover {
              background: #8b5cf6;
              color: white;
              border-color: #8b5cf6;
              transform: translateY(-1px);
              box-shadow: 0 4px 6px rgba(139,92,246,0.3);
            }
            .rbc-toolbar button.rbc-active {
              background: linear-gradient(135deg, #8b5cf6, #7c3aed);
              color: white;
              border-color: transparent;
              box-shadow: 0 4px 6px rgba(139,92,246,0.4);
            }
            .rbc-toolbar-label {
              font-size: 18px;
              font-weight: 700;
              color: #1e293b;
            }
            .rbc-header {
              padding: 16px 8px;
              font-weight: 700;
              font-size: 13px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #475569;
              background: linear-gradient(to bottom, #f8fafc, white);
              border-bottom: 2px solid #e2e8f0;
              flex: 1 1 0 !important;
              min-width: 0 !important;
              text-align: center;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .rbc-time-header-content {
              border-left: none;
            }
            .rbc-time-header-content > .rbc-row {
              display: flex;
            }
            .rbc-time-header-content .rbc-header {
              flex: 1 1 0 !important;
              width: auto !important;
            }
            .rbc-time-header.rbc-overflowing {
              border-right: none;
            }
            .rbc-allday-cell {
              display: none;
            }
            .rbc-time-header > .rbc-row.rbc-row-resource {
              display: none;
            }
            .rbc-time-header > .rbc-row:first-child {
              display: none;
            }
            .rbc-time-header-gutter {
              flex: 0 0 auto !important;
              width: 80px !important;
              min-width: 80px !important;
              max-width: 80px !important;
            }
            .rbc-label.rbc-time-header-gutter {
              background: linear-gradient(to bottom, #f8fafc, white);
              border-bottom: 2px solid #e2e8f0;
            }
            .rbc-time-gutter {
              width: 80px !important;
              min-width: 80px !important;
              max-width: 80px !important;
            }
            .rbc-time-view {
              border: none;
            }
            .rbc-time-content {
              border-top: none;
            }
            .rbc-time-content > * > * {
              flex: 1 1 0 !important;
            }
            .rbc-day-slot {
              flex: 1 1 0 !important;
            }
            .rbc-time-slot {
              border-top: 1px solid #f1f5f9;
            }
            .rbc-label {
              text-align: center;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              font-weight: 600;
              color: #64748b;
              height: 100%;
              padding: 0 8px !important;
            }
            .rbc-timeslot-group {
              min-height: 60px;
              border-left: 1px solid #e2e8f0;
            }
            .rbc-today {
              background: linear-gradient(to bottom, #eff6ff, #dbeafe);
            }
            .rbc-current-time-indicator {
              background-color: #ef4444;
              height: 2px;
            }
            .rbc-event {
              border-radius: 6px;
              border: none;
              padding: 4px 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              transition: all 0.2s;
            }
            .rbc-event:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 8px rgba(0,0,0,0.15);
            }
          `}</style>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            defaultView="week"
            views={["week"]}
            step={60}
            timeslots={1}
            min={new Date(2024, 0, 1, 6, 0)}
            max={new Date(2024, 0, 1, 23, 0)}
            onSelectEvent={(event) => setSelectedEvent(event.resource)}
            eventPropGetter={(event) => {
              const category = event.resource.category || "study";

              // For study tasks, use subject-based colors
              if (category === "study") {
                const taskName = event.resource.task || event.title;
                const hash = taskName
                  .split("")
                  .reduce((acc, char) => acc + char.charCodeAt(0), 0);
                const color = SUBJECT_COLORS[hash % SUBJECT_COLORS.length];

                return {
                  style: {
                    background: color.bg,
                    borderLeft: `4px solid ${color.border}`,
                    color: "white",
                    fontSize: "12px",
                    fontWeight: "600",
                    padding: "6px 8px",
                  },
                };
              }

              // For other categories, use category colors with fallback
              const color =
                CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] ||
                CATEGORY_COLORS.study;

              if (!color) {
                console.warn(
                  "Unknown category:",
                  category,
                  "for event:",
                  event
                );
                return { style: {} };
              }

              return {
                style: {
                  background: color.bg,
                  borderLeft: `4px solid ${color.border}`,
                  color: color.text,
                  fontSize: "12px",
                  fontWeight: "600",
                  padding: "6px 8px",
                },
              };
            }}
            style={{ height: "100%" }}
          />
        </div>
      </div>

      {/* Detail Modal */}
      {selectedEvent &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 99999,
              margin: 0,
            }}
            onClick={() => setSelectedEvent(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-4 space-y-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">
                    {CATEGORY_ICONS[
                      selectedEvent.category as keyof typeof CATEGORY_ICONS
                    ] || "📝"}
                  </span>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {selectedEvent.task}
                    </h3>
                    {selectedEvent.priority && (
                      <Badge
                        className={
                          selectedEvent.priority === "high"
                            ? "bg-red-100 text-red-700 border-red-300"
                            : selectedEvent.priority === "medium"
                            ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                            : "bg-green-100 text-green-700 border-green-300"
                        }
                      >
                        {selectedEvent.priority === "high"
                          ? "🔥 Ưu tiên cao"
                          : selectedEvent.priority === "medium"
                          ? "⚡ Ưu tiên trung bình"
                          : "✅ Ưu tiên thấp"}
                      </Badge>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <span className="text-2xl">📅</span>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">
                      Ngày
                    </div>
                    <div className="text-sm font-semibold text-slate-900">
                      {selectedEvent.dayName}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <span className="text-2xl">🕐</span>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">
                      Thời gian
                    </div>
                    <div className="text-sm font-semibold text-slate-900">
                      {selectedEvent.timeRange}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <span className="text-2xl">⏱️</span>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">
                      Thời lượng
                    </div>
                    <div className="text-sm font-semibold text-slate-900">
                      {selectedEvent.duration}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                  <span className="text-2xl">🏷️</span>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">
                      Loại
                    </div>
                    <div className="text-sm font-semibold text-slate-900 capitalize">
                      {selectedEvent.category}
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedEvent(null)}
                className="w-full py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
