import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Plus, X, Calendar, Clock } from "lucide-react";
import { Deadline } from "./ScheduleGeneratorTab";

interface DeadlineFormProps {
  deadlines: Deadline[];
  onAddDeadline: (deadline: Omit<Deadline, "id">) => void;
  onRemoveDeadline: (id: string) => void;
}

export function DeadlineForm({
  deadlines,
  onAddDeadline,
  onRemoveDeadline,
}: DeadlineFormProps) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [details, setDetails] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && dueDate && estimatedHours) {
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
      });
      // Reset form
      setTitle("");
      setDueDate("");
      setEstimatedHours("");
      setDetails("");
    }
  };

  return (
    <Card className="border-violet-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-violet-600" />
          Deadlines & Assignments
        </CardTitle>
        <CardDescription>
          Add all your upcoming deadlines with estimated work hours
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Assignment Title</Label>
            <Input
              id="title"
              placeholder="e.g., Research Paper for CS301"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hours">Estimated Hours</Label>
              <Input
                id="hours"
                type="number"
                placeholder="e.g., 8"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                min="0.5"
                step="0.5"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Details (optional)</Label>
            <Textarea
              id="details"
              placeholder="Additional notes about this assignment..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="resize-none"
              rows={2}
            />
          </div>

          <Button type="submit" className="w-full" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Deadline
          </Button>
        </form>

        {/* Deadlines List */}
        {deadlines.length > 0 && (
          <div className="space-y-2 mt-6 pt-6 border-t border-slate-200">
            <h4 className="text-slate-700 mb-3">
              Current Deadlines ({deadlines.length})
            </h4>
            {deadlines.map((deadline) => (
              <div
                key={deadline.id}
                className="bg-violet-50 rounded-lg p-3 border border-violet-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-slate-900">{deadline.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(deadline.dueDate).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {deadline.estimatedHours}h
                      </span>
                    </div>
                    {deadline.details && (
                      <p className="text-slate-600 text-xs mt-1">
                        {deadline.details}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
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
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (confirm(`Xóa deadline "${deadline.title}"?`)) {
                          onRemoveDeadline(deadline.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Xóa"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
