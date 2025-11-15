import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
  title: string;
  location?: string;
  instructor?: string;
  courseCode?: string;
  isImported?: boolean;
  weeks?: number;
}

interface TimeBlockerProps {
  blockedSlots: TimeSlot[];
  onBlockedSlotsChange: (slots: TimeSlot[]) => void;
}

const dayMap: Record<string, number> = {
  'Sunday': 0,
  'Monday': 1,
  'Tuesday': 2,
  'Wednesday': 3,
  'Thursday': 4,
  'Friday': 5,
  'Saturday': 6,
};

export function TimeBlocker({ blockedSlots, onBlockedSlotsChange }: TimeBlockerProps) {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; event: any } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    location: '',
    instructor: '',
    courseCode: '',
    day: '',
    startTime: '',
    endTime: '',
  });

  // Convert TimeSlot to Calendar Event format
  const events = useMemo(() => {
    const today = moment().startOf('week');
    const allEvents: any[] = [];
    
    // Get number of weeks from first slot (default to 1)
    const numWeeks = blockedSlots[0]?.weeks || 1;
    
    // Generate events for each week
    for (let weekOffset = 0; weekOffset < numWeeks; weekOffset++) {
      blockedSlots.forEach((slot, idx) => {
        if (!slot.startTime || !slot.endTime) {
          console.warn('⚠️ Invalid slot:', slot);
          return;
        }
        
        const dayOfWeek = dayMap[slot.day];
        const eventDate = today.clone().add(dayOfWeek + (weekOffset * 7), 'days');
        
        const [startHour, startMin] = slot.startTime.split(':').map(Number);
        const [endHour, endMin] = slot.endTime.split(':').map(Number);
        
        const start = eventDate.clone().hour(startHour).minute(startMin).toDate();
        const end = eventDate.clone().hour(endHour).minute(endMin).toDate();
        
        allEvents.push({
          id: `${weekOffset}-${idx}`,
          title: slot.title,
          start,
          end,
          resource: slot,
          weekNumber: weekOffset + 1,
        });
      });
    }
    
    return allEvents;
  }, [blockedSlots]);

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event.resource);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setEditForm({
      title: selectedEvent.title || '',
      location: selectedEvent.location || '',
      instructor: selectedEvent.instructor || '',
      courseCode: selectedEvent.courseCode || '',
      day: selectedEvent.day || '',
      startTime: selectedEvent.startTime || '',
      endTime: selectedEvent.endTime || '',
    });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    const updatedSlots = blockedSlots.map(slot => 
      slot === selectedEvent ? { 
        ...slot, 
        title: editForm.title,
        location: editForm.location,
        instructor: editForm.instructor,
        courseCode: editForm.courseCode,
        day: editForm.day,
        startTime: editForm.startTime,
        endTime: editForm.endTime,
      } : slot
    );
    onBlockedSlotsChange(updatedSlots);
    setSelectedEvent(null);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm(`Xóa lịch "${selectedEvent.title}"?`)) {
      const updatedSlots = blockedSlots.filter(slot => slot !== selectedEvent);
      onBlockedSlotsChange(updatedSlots);
      setSelectedEvent(null);
      setIsEditing(false);
    }
  };

  const handleContextMenu = (event: any, e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, event: event.resource });
  };

  const handleChangeLocation = () => {
    if (!contextMenu) return;
    const newLocation = prompt('Enter new location:', contextMenu.event.location || '');
    if (newLocation !== null) {
      const updatedSlots = blockedSlots.map(slot => 
        slot === contextMenu.event ? { ...slot, location: newLocation } : slot
      );
      onBlockedSlotsChange(updatedSlots);
    }
    setContextMenu(null);
  };

  return (
    <>
      <div className="h-[600px] bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl shadow-lg p-4 relative">
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
            background: #3b82f6;
            color: white;
            border-color: #3b82f6;
            transform: translateY(-1px);
            box-shadow: 0 4px 6px rgba(59,130,246,0.3);
          }
          .rbc-toolbar button.rbc-active {
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            color: white;
            border-color: transparent;
            box-shadow: 0 4px 6px rgba(59,130,246,0.4);
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
          }
          .rbc-timeslot-group {
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
          views={['week']}
          step={60}
          timeslots={1}
          min={new Date(2024, 0, 1, 6, 0)}
          max={new Date(2024, 0, 1, 23, 0)}
          onSelectEvent={handleSelectEvent}
          components={{
            event: ({ event }: any) => (
              <div onContextMenu={(e) => handleContextMenu(event, e)}>
                {event.title}
              </div>
            ),
          }}
          eventPropGetter={(event) => {
            const colors = [
              { bg: 'linear-gradient(135deg, #10b981, #059669)', border: '#059669', name: 'green' },
              { bg: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: '#2563eb', name: 'blue' },
              { bg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', border: '#7c3aed', name: 'purple' },
              { bg: 'linear-gradient(135deg, #f59e0b, #d97706)', border: '#d97706', name: 'orange' },
              { bg: 'linear-gradient(135deg, #ec4899, #db2777)', border: '#db2777', name: 'pink' },
              { bg: 'linear-gradient(135deg, #06b6d4, #0891b2)', border: '#0891b2', name: 'cyan' },
              { bg: 'linear-gradient(135deg, #84cc16, #65a30d)', border: '#65a30d', name: 'lime' },
              { bg: 'linear-gradient(135deg, #f43f5e, #e11d48)', border: '#e11d48', name: 'rose' },
              { bg: 'linear-gradient(135deg, #a855f7, #9333ea)', border: '#9333ea', name: 'violet' },
              { bg: 'linear-gradient(135deg, #14b8a6, #0d9488)', border: '#0d9488', name: 'teal' },
            ];
            
            // Hash the event title to get consistent color for same subject
            const hash = event.title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const color = colors[hash % colors.length];
            
            return {
              style: {
                background: color.bg,
                borderLeft: `4px solid ${color.border}`,
                color: 'white',
                fontSize: '12px',
                fontWeight: '600',
                padding: '6px 8px',
              },
            };
          }}
          style={{ height: '100%' }}
        />
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
          />
          <div
            className="fixed bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              onClick={handleChangeLocation}
              className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 flex items-center gap-2"
            >
              📍 Change Location
            </button>
          </div>
        </>
      )}

      {/* Detail/Edit Modal - Portal to body */}
      {selectedEvent && createPortal(
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99999,
            margin: 0,
          }}
          onClick={() => {
            setSelectedEvent(null);
            setIsEditing(false);
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-bold text-slate-900 flex-1 pr-4">
                {isEditing ? '✏️ Chỉnh sửa lịch học' : selectedEvent.title}
              </h3>
              <button
                onClick={() => {
                  setSelectedEvent(null);
                  setIsEditing(false);
                }}
                className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {!isEditing ? (
              <>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <span className="text-2xl">📅</span>
                    <div>
                      <div className="text-xs text-slate-500 font-medium">Thứ</div>
                      <div className="text-sm font-semibold text-slate-900">{selectedEvent.day}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <span className="text-2xl">🕐</span>
                    <div>
                      <div className="text-xs text-slate-500 font-medium">Giờ học</div>
                      <div className="text-sm font-semibold text-slate-900">
                        {selectedEvent.startTime} - {selectedEvent.endTime}
                      </div>
                    </div>
                  </div>

                  {selectedEvent.location && (
                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                      <span className="text-2xl">📍</span>
                      <div>
                        <div className="text-xs text-slate-500 font-medium">Phòng học</div>
                        <div className="text-sm font-semibold text-slate-900">{selectedEvent.location}</div>
                      </div>
                    </div>
                  )}

                  {selectedEvent.instructor && (
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <span className="text-2xl">👨‍🏫</span>
                      <div>
                        <div className="text-xs text-slate-500 font-medium">Giảng viên</div>
                        <div className="text-sm font-semibold text-slate-900">{selectedEvent.instructor}</div>
                      </div>
                    </div>
                  )}

                  {selectedEvent.courseCode && (
                    <div className="flex items-center gap-3 p-3 bg-cyan-50 rounded-lg">
                      <span className="text-2xl">🔖</span>
                      <div>
                        <div className="text-xs text-slate-500 font-medium">Mã môn</div>
                        <div className="text-sm font-semibold text-slate-900">{selectedEvent.courseCode}</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleEdit}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    ✏️ Sửa
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    🗑️ Xóa
                  </button>
                </div>

                <button
                  onClick={() => setSelectedEvent(null)}
                  className="w-full py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition-colors"
                >
                  Đóng
                </button>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Tên môn học <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="VD: Toán cao cấp"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Mã môn
                    </label>
                    <input
                      type="text"
                      value={editForm.courseCode}
                      onChange={(e) => setEditForm({ ...editForm, courseCode: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="VD: MATH101"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Thứ <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={editForm.day}
                      onChange={(e) => setEditForm({ ...editForm, day: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Monday">Thứ 2</option>
                      <option value="Tuesday">Thứ 3</option>
                      <option value="Wednesday">Thứ 4</option>
                      <option value="Thursday">Thứ 5</option>
                      <option value="Friday">Thứ 6</option>
                      <option value="Saturday">Thứ 7</option>
                      <option value="Sunday">Chủ nhật</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Giờ bắt đầu <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        value={editForm.startTime}
                        onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Giờ kết thúc <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        value={editForm.endTime}
                        onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Phòng học
                    </label>
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="VD: A101, Lab B"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Giảng viên
                    </label>
                    <input
                      type="text"
                      value={editForm.instructor}
                      onChange={(e) => setEditForm({ ...editForm, instructor: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="VD: TS. Nguyễn Văn A"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleSaveEdit}
                    disabled={!editForm.title || !editForm.day || !editForm.startTime || !editForm.endTime}
                    className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    ✓ Lưu
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
