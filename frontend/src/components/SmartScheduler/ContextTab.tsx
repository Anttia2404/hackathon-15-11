import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Sparkles, Upload, Calendar as CalendarIcon } from "lucide-react";
import { TimeBlocker } from "./TimeBlocker";
import { Badge } from "../ui/badge";
import { api } from "../../services/api";

interface ContextTabProps {
  timetableData: any[];
  setTimetableData: (data: any[]) => void;
}

export function ContextTab({
  timetableData,
  setTimetableData,
}: ContextTabProps) {
  const [rawTimetable, setRawTimetable] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [weeks, setWeeks] = useState("1");
  const [showImportForm, setShowImportForm] = useState(false);

  const handleAIImport = async () => {
    setIsImporting(true);
    setImportSuccess(false);
    setError("");
    setShowPreview(false);

    try {
      const { parseTimetableWithAI } = await import("../../utils/aiScheduler");
      const result = await parseTimetableWithAI(rawTimetable);
      setPreview(result);
      setShowPreview(true);
    } catch (err: any) {
      setError(err.message || "Cannot parse. Please check format.");
    } finally {
      setIsImporting(false);
    }
  };

  const handleApply = async () => {
    const importedSlots = preview.map((slot) => ({
      ...slot,
      isImported: true,
      weeks: parseInt(weeks) || 1,
    }));

    // Save to database
    try {
      const { api } = await import("../../services/api");
      await api.timetable.save(importedSlots);
      console.log("✅ Timetable saved to database");
    } catch (error) {
      console.error("Failed to save timetable:", error);
    }

    setTimetableData(importedSlots);
    setImportSuccess(true);
    setShowPreview(false);
    setShowImportForm(false);
    setRawTimetable("");
    setTimeout(() => setImportSuccess(false), 3000);
  };

  // Check if timetable exists
  const hasTimetable = timetableData.length > 0;

  const handleReplaceClick = async () => {
    if (
      confirm(
        "Bạn có chắc muốn thay thế toàn bộ thời khóa biểu hiện tại? Dữ liệu cũ sẽ bị xóa vĩnh viễn."
      )
    ) {
      try {
        // Clear timetable in database first
        await api.timetable.save([], undefined); // Save empty array to delete all

        // Clear frontend state
        setTimetableData([]);
        setShowImportForm(true);
      } catch (error) {
        console.error("Error clearing timetable:", error);
        alert("Có lỗi khi xóa thời khóa biểu cũ. Vui lòng thử lại.");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Import Timetable Section */}
      {!hasTimetable || showImportForm ? (
        <Card className="border-blue-200 shadow-sm">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-600" />
                  Import Timetable via Text
                </CardTitle>
                <CardDescription className="mt-2">
                  Paste your full timetable. AI will convert it into structured
                  schedule data.
                </CardDescription>
              </div>
              {importSuccess && (
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  ✓ Imported successfully
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Example:
Monday 9:00-11:00 CS301 Advanced Algorithms - Room 401
Tuesday 14:00-16:00 MATH210 Linear Algebra - Building B
..."
              value={rawTimetable}
              onChange={(e) => {
                setRawTimetable(e.target.value);
                setError("");
              }}
              className="min-h-[200px] font-mono text-sm"
            />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {showPreview && preview.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-blue-900">
                    ✅ Found {preview.length} classes
                  </span>
                </div>

                <div className="flex items-center gap-3 bg-white rounded p-3">
                  <Label className="text-sm font-medium text-slate-700">
                    Apply for:
                  </Label>
                  <input
                    type="number"
                    min="1"
                    max="16"
                    value={weeks}
                    onChange={(e) => setWeeks(e.target.value)}
                    className="w-20 px-3 py-1 border border-slate-300 rounded text-sm text-center"
                  />
                  <span className="text-sm text-slate-600">week(s)</span>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {preview.slice(0, 3).map((slot, idx) => (
                    <div key={idx} className="bg-white rounded p-2 text-xs">
                      <span className="font-semibold">{slot.day}</span> •{" "}
                      {slot.startTime}-{slot.endTime} • {slot.title}
                    </div>
                  ))}
                  {preview.length > 3 && (
                    <p className="text-xs text-blue-600 text-center">
                      + {preview.length - 3} more...
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleApply}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    ✓ Apply
                  </Button>
                  <Button
                    onClick={() => setShowPreview(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <Button
              onClick={handleAIImport}
              disabled={!rawTimetable.trim() || isImporting || showPreview}
              className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isImporting ? "Processing with AI..." : "Import with AI"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-200 shadow-sm bg-gradient-to-br from-green-50 to-blue-50">
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">✅</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Thời khóa biểu đã được import
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  Bạn có {timetableData.length} lịch học. Xem chi tiết bên dưới.
                </p>
              </div>
              <Button
                onClick={handleReplaceClick}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                🔄 Thay thế thời khóa biểu mới
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Calendar */}
      {timetableData.length > 0 && !showImportForm && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-violet-600" />
              Weekly Schedule Overview
            </CardTitle>
            <CardDescription>
              Visual calendar showing your busy times
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6 overflow-hidden">
            <TimeBlocker
              blockedSlots={timetableData}
              onBlockedSlotsChange={setTimetableData}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
