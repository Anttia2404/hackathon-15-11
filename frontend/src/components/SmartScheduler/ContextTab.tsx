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
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Sparkles, Upload, Calendar as CalendarIcon } from "lucide-react";
import { TimeBlocker } from "./TimeBlocker";
import { parseTimetableWithAI } from "../../utils/aiParser";
import { Badge } from "../ui/badge";

interface ContextTabProps {
  timetableData: any[];
  setTimetableData: (data: any[]) => void;
  hardLimits: {
    noAfter23: boolean;
    noSundays: boolean;
  };
  setHardLimits: (limits: any) => void;
}

export function ContextTab({
  timetableData,
  setTimetableData,
  hardLimits,
  setHardLimits,
}: ContextTabProps) {
  const [rawTimetable, setRawTimetable] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  const handleAIImport = async () => {
    setIsImporting(true);
    setImportSuccess(false);

    // Simulate AI processing
    setTimeout(() => {
      const parsed = parseTimetableWithAI(rawTimetable);
      setTimetableData(parsed);
      setIsImporting(false);
      setImportSuccess(true);

      // Reset success message after 3 seconds
      setTimeout(() => setImportSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Import Timetable Section */}
      <Card className="border-blue-200 shadow-sm">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                Import Timetable via Text
              </CardTitle>
              <CardDescription className="mt-2">
                Paste your full timetable (copy from UTEX, Google Calendar,
                etc.). AI will convert it into structured schedule data.
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
Monday 14:00-16:00 MATH210 Linear Algebra - Building B
Tuesday 10:00-12:00 ENG150 Technical Writing
..."
            value={rawTimetable}
            onChange={(e) => setRawTimetable(e.target.value)}
            className="min-h-[200px] font-mono text-sm"
          />
          <Button
            onClick={handleAIImport}
            disabled={!rawTimetable.trim() || isImporting}
            className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isImporting ? "Processing with AI..." : "Import with AI"}
          </Button>
        </CardContent>
      </Card>

      {/* Manual Time Blocker */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-violet-600" />
            Manual Schedule Blocking
          </CardTitle>
          <CardDescription>
            Click and drag to block specific time slots that are unavailable for
            studying
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TimeBlocker
            blockedSlots={timetableData}
            onBlockedSlotsChange={setTimetableData}
          />
        </CardContent>
      </Card>

      {/* Hard Limits */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Hard Limits</CardTitle>
          <CardDescription>
            Set strict constraints that AI must always respect
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="no-after-23"
              checked={hardLimits.noAfter23}
              onCheckedChange={(checked) =>
                setHardLimits({ ...hardLimits, noAfter23: checked as boolean })
              }
            />
            <Label
              htmlFor="no-after-23"
              className="text-slate-700 cursor-pointer"
            >
              Do not schedule any tasks after 23:00 (11 PM)
            </Label>
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox
              id="no-sundays"
              checked={hardLimits.noSundays}
              onCheckedChange={(checked) =>
                setHardLimits({ ...hardLimits, noSundays: checked as boolean })
              }
            />
            <Label
              htmlFor="no-sundays"
              className="text-slate-700 cursor-pointer"
            >
              No scheduling on Sundays (keep it free for rest)
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Current Schedule Preview */}
      {timetableData.length > 0 && (
        <Card className="border-green-200 bg-green-50/30 shadow-sm">
          <CardHeader>
            <CardTitle className="text-green-900">
              Current Schedule Overview
            </CardTitle>
            <CardDescription className="text-green-700">
              {timetableData.length} time blocks imported
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {timetableData.slice(0, 6).map((slot, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-3 border border-green-200"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-slate-900">{slot.title}</p>
                      <p className="text-slate-600 text-sm">
                        {slot.day} • {slot.startTime} - {slot.endTime}
                      </p>
                      {slot.location && (
                        <p className="text-slate-500 text-xs mt-1">
                          📍 {slot.location}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {timetableData.length > 6 && (
              <p className="text-slate-600 text-sm mt-3 text-center">
                + {timetableData.length - 6} more blocks
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
