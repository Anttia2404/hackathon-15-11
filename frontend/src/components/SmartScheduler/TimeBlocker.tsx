import { useState } from "react";

interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
  title: string;
}

interface TimeBlockerProps {
  blockedSlots: TimeSlot[];
  onBlockedSlotsChange: (slots: TimeSlot[]) => void;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const FULL_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const HOURS = Array.from({ length: 15 }, (_, i) => i + 8); // 8:00 to 22:00

export function TimeBlocker({
  blockedSlots,
  onBlockedSlotsChange,
}: TimeBlockerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{
    day: string;
    hour: number;
  } | null>(null);

  const isBlocked = (day: string, hour: number) => {
    return blockedSlots.some((slot) => {
      if (slot.day !== day) return false;
      const slotStart = parseInt(slot.startTime.split(":")[0]);
      const slotEnd = parseInt(slot.endTime.split(":")[0]);
      return hour >= slotStart && hour < slotEnd;
    });
  };

  const handleMouseDown = (day: string, hour: number) => {
    setIsDragging(true);
    setDragStart({ day, hour });
  };

  const handleMouseUp = (day: string, hour: number) => {
    if (isDragging && dragStart && dragStart.day === day) {
      const startHour = Math.min(dragStart.hour, hour);
      const endHour = Math.max(dragStart.hour, hour) + 1;

      const fullDay = FULL_DAYS[DAYS.indexOf(day)];
      const newSlot: TimeSlot = {
        day: fullDay,
        startTime: `${startHour}:00`,
        endTime: `${endHour}:00`,
        title: "Blocked Time",
      };

      // Remove overlapping slots and add new one
      const filteredSlots = blockedSlots.filter(
        (slot) =>
          slot.day !== fullDay ||
          parseInt(slot.endTime.split(":")[0]) <= startHour ||
          parseInt(slot.startTime.split(":")[0]) >= endHour
      );

      onBlockedSlotsChange([...filteredSlots, newSlot]);
    }
    setIsDragging(false);
    setDragStart(null);
  };

  const handleCellClick = (day: string, hour: number) => {
    // Toggle block on click
    const fullDay = FULL_DAYS[DAYS.indexOf(day)];
    const existingSlotIndex = blockedSlots.findIndex(
      (slot) =>
        slot.day === fullDay &&
        hour >= parseInt(slot.startTime.split(":")[0]) &&
        hour < parseInt(slot.endTime.split(":")[0])
    );

    if (existingSlotIndex !== -1) {
      // Remove the slot
      const newSlots = blockedSlots.filter(
        (_, index) => index !== existingSlotIndex
      );
      onBlockedSlotsChange(newSlots);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="mb-4">
        <h3 className="text-base font-medium text-slate-900 mb-1 flex items-center gap-2">
          <span className="text-purple-600">📅</span>
          Manual Schedule Blocking
        </h3>
        <p className="text-sm text-slate-500">
          Click and drag to block specific time slots that are unavailable for
          studying
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full border border-slate-300 rounded-lg overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="w-20 p-3 text-left text-xs font-medium text-slate-500 border-r border-slate-300"></th>
                {DAYS.map((day, index) => (
                  <th
                    key={day}
                    className={`p-3 text-center text-sm font-medium text-slate-700 min-w-[100px] ${
                      index < DAYS.length - 1 ? "border-r border-slate-300" : ""
                    }`}
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOURS.map((hour, hourIndex) => (
                <tr
                  key={hour}
                  className={
                    hourIndex < HOURS.length - 1
                      ? "border-b border-slate-300"
                      : ""
                  }
                >
                  <td className="p-2 text-right text-sm font-medium text-slate-600 pr-4 bg-slate-50 border-r border-slate-300">
                    {hour.toString().padStart(2, "0")}:00
                  </td>
                  {DAYS.map((day, dayIndex) => {
                    const fullDay = FULL_DAYS[dayIndex];
                    const blocked = isBlocked(fullDay, hour);
                    return (
                      <td
                        key={`${day}-${hour}`}
                        className={`p-0 ${
                          dayIndex < DAYS.length - 1
                            ? "border-r border-slate-300"
                            : ""
                        }`}
                      >
                        <div
                          className={`h-14 w-full cursor-pointer transition-colors ${
                            blocked
                              ? "bg-blue-100 hover:bg-blue-200"
                              : "bg-white hover:bg-slate-50"
                          }`}
                          onMouseDown={() => handleMouseDown(day, hour)}
                          onMouseUp={() => handleMouseUp(day, hour)}
                          onClick={() => handleCellClick(day, hour)}
                          onMouseLeave={() => {
                            if (isDragging) {
                              setIsDragging(false);
                              setDragStart(null);
                            }
                          }}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2 text-sm text-slate-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
        <span className="text-lg">💡</span>
        <p className="pt-0.5">
          Click to toggle individual blocks, or drag to select multiple hours
        </p>
      </div>
    </div>
  );
}
