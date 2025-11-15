import { useState } from 'react';

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

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const HOURS = Array.from({ length: 15 }, (_, i) => i + 8); // 8 AM to 10 PM

export function TimeBlocker({ blockedSlots, onBlockedSlotsChange }: TimeBlockerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ day: string; hour: number } | null>(null);

  const isBlocked = (day: string, hour: number) => {
    return blockedSlots.some((slot) => {
      if (slot.day !== day) return false;
      const slotStart = parseInt(slot.startTime.split(':')[0]);
      const slotEnd = parseInt(slot.endTime.split(':')[0]);
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

      const newSlot: TimeSlot = {
        day,
        startTime: `${startHour}:00`,
        endTime: `${endHour}:00`,
        title: 'Blocked Time',
      };

      // Remove overlapping slots and add new one
      const filteredSlots = blockedSlots.filter(
        (slot) =>
          slot.day !== day ||
          parseInt(slot.endTime.split(':')[0]) <= startHour ||
          parseInt(slot.startTime.split(':')[0]) >= endHour
      );

      onBlockedSlotsChange([...filteredSlots, newSlot]);
    }
    setIsDragging(false);
    setDragStart(null);
  };

  const handleCellClick = (day: string, hour: number) => {
    // Toggle block on click
    const existingSlotIndex = blockedSlots.findIndex(
      (slot) =>
        slot.day === day &&
        hour >= parseInt(slot.startTime.split(':')[0]) &&
        hour < parseInt(slot.endTime.split(':')[0])
    );

    if (existingSlotIndex !== -1) {
      // Remove the slot
      const newSlots = blockedSlots.filter((_, index) => index !== existingSlotIndex);
      onBlockedSlotsChange(newSlots);
    }
  };

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <div className="grid grid-cols-8 gap-1">
          {/* Header row */}
          <div className="p-2"></div>
          {DAYS.map((day) => (
            <div key={day} className="p-2 text-center text-slate-700 text-sm">
              {day.slice(0, 3)}
            </div>
          ))}

          {/* Time slots */}
          {HOURS.map((hour) => (
            <div key={hour} className="contents">
              <div className="p-2 text-slate-600 text-sm text-right">
                {hour}:00
              </div>
              {DAYS.map((day) => (
                <div
                  key={`${day}-${hour}`}
                  className={`h-10 border border-slate-200 rounded cursor-pointer transition-colors ${
                    isBlocked(day, hour)
                      ? 'bg-blue-100 border-blue-300'
                      : 'bg-white hover:bg-slate-50'
                  }`}
                  onMouseDown={() => handleMouseDown(day, hour)}
                  onMouseUp={() => handleMouseUp(day, hour)}
                  onClick={() => handleCellClick(day, hour)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <p className="text-slate-500 text-sm mt-4">
        💡 Click to toggle individual blocks, or drag to select multiple hours
      </p>
    </div>
  );
}
