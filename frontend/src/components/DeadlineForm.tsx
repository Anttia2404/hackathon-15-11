import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Calendar, Clock, Trash2, Plus } from 'lucide-react';

export interface Deadline {
  id: string;
  title: string;
  dueDate: string;
  estimatedHours: number;
  details: string;
  priority?: string;
  type?: 'flexible' | 'fixed'; // flexible = tự học, fixed = kiểm tra/thi
  fixedTime?: string; // Giờ cố định nếu type = 'fixed'
}

interface DeadlineFormProps {
  deadlines: Deadline[];
  onAddDeadline: (deadline: Omit<Deadline, 'id'>) => void;
  onRemoveDeadline: (id: string) => void;
  timetableData?: any[]; // Thời khóa biểu để chọn
}

export function DeadlineForm({ deadlines, onAddDeadline, onRemoveDeadline, timetableData = [] }: DeadlineFormProps) {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [details, setDetails] = useState('');
  const [type, setType] = useState<'flexible' | 'fixed'>('flexible');
  const [fixedTime, setFixedTime] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !dueDate || !estimatedHours) {
      alert('Vui lòng điền đầy đủ: Tên, Hạn chót, và Số giờ ước tính');
      return;
    }

    // Check duplicate
    const isDuplicate = deadlines.some(
      d => d.title.toLowerCase() === title.toLowerCase() && 
           d.dueDate === dueDate
    );

    if (isDuplicate) {
      alert(`⚠️ Deadline "${title}" với ngày ${new Date(dueDate).toLocaleDateString('vi-VN')} đã tồn tại!`);
      return;
    }

    onAddDeadline({
      title,
      dueDate,
      estimatedHours: parseFloat(estimatedHours),
      details,
      priority: calculatePriority(dueDate, parseFloat(estimatedHours)),
      type,
      fixedTime: type === 'fixed' ? fixedTime : undefined
    });

    // Reset form
    setTitle('');
    setDueDate('');
    setEstimatedHours('');
    setDetails('');
    setType('flexible');
    setFixedTime('');
  };

  const calculatePriority = (dueDate: string, hours: number): string => {
    const daysUntil = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil <= 2 || hours >= 8) return 'high';
    if (daysUntil <= 5 || hours >= 4) return 'medium';
    return 'low';
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default: return 'bg-green-100 text-green-700 border-green-300';
    }
  };

  return (
    <Card className="border-violet-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-violet-600" />
          Danh sách Deadlines
        </CardTitle>
        <CardDescription>
          Nhập các deadline kèm chi tiết. AI sẽ phân tích và tự động tăng thời gian nếu bạn "yếu" môn đó.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-slate-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Tên deadline *</Label>
              <Input
                id="title"
                placeholder="VD: Bài tập Toán, Báo cáo Web..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dueDate">Hạn chót *</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="estimatedHours">Số giờ ước tính *</Label>
              <Input
                id="estimatedHours"
                type="number"
                step="0.5"
                min="0.5"
                placeholder="VD: 4"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="type">Loại deadline *</Label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as 'flexible' | 'fixed')}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              >
                <option value="flexible">📚 Tự học (linh hoạt)</option>
                <option value="fixed">📝 Kiểm tra/Thi (giờ cố định)</option>
              </select>
            </div>
          </div>

          {type === 'fixed' && (
            <div>
              <Label htmlFor="fixedTime">Chọn slot trong thời khóa biểu *</Label>
              {timetableData.length > 0 ? (
                <select
                  id="fixedTime"
                  value={fixedTime}
                  onChange={(e) => setFixedTime(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                >
                  <option value="">-- Chọn slot --</option>
                  {timetableData.map((slot, idx) => (
                    <option key={idx} value={`${slot.day}|${slot.startTime}-${slot.endTime}`}>
                      {slot.day} {slot.startTime}-{slot.endTime} - {slot.title}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-700">
                  ⚠️ Chưa có thời khóa biểu. Vui lòng import thời khóa biểu trước.
                </div>
              )}
              <p className="text-xs text-slate-500 mt-1">
                💡 Chọn slot trong TKB để đánh dấu là giờ kiểm tra/thi
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="details">Chi tiết (details)</Label>
            <Textarea
              id="details"
              placeholder='VD: "Em yếu môn này", "Chưa có nền tảng", "Cần ôn lại từ đầu"...'
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-slate-500 mt-1">
              💡 Nếu bạn viết "yếu" hoặc "chưa có nền", AI sẽ tự động tăng thời gian lên 30%
            </p>
          </div>

          <Button type="submit" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Thêm Deadline
          </Button>
        </form>

        {/* Danh sách deadlines */}
        {deadlines.length > 0 && (
          <div className="space-y-2 mt-4">
            <h4 className="text-sm font-medium text-slate-700">
              Deadlines đã thêm ({deadlines.length})
            </h4>
            {deadlines.map((deadline) => (
              <div
                key={deadline.id}
                className="flex items-start justify-between p-3 bg-white border border-slate-200 rounded-lg hover:border-violet-300 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="font-medium text-slate-900">{deadline.title}</h5>
                    <Badge className={getPriorityColor(deadline.priority)}>
                      {deadline.priority === 'high' ? '🔥 Khẩn' : deadline.priority === 'medium' ? '⚠️ Trung bình' : '✅ Thấp'}
                    </Badge>
                    {deadline.type === 'fixed' && (
                      <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                        📝 Cố định
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(deadline.dueDate).toLocaleDateString('vi-VN')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {deadline.estimatedHours}h
                    </span>
                  </div>
                  {deadline.details && (
                    <p className="text-xs text-slate-500 mt-1 italic">"{deadline.details}"</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm(`Đánh dấu "${deadline.title}" là hoàn thành?`)) {
                        onRemoveDeadline(deadline.id);
                      }
                    }}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    title="Hoàn thành"
                  >
                    ✓
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm(`Xóa deadline "${deadline.title}"?`)) {
                        onRemoveDeadline(deadline.id);
                      }
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {deadlines.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>Chưa có deadline nào. Thêm deadline đầu tiên!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
