import { useState } from "react";
import { Plus, Sparkles, Trash2 } from "lucide-react";

interface Deadline {
  title: string;
  dueDate: string;
  estimatedHours: number;
  details?: string;
}

interface ScheduleGeneratorProps {
  timetableData: any[];
}

export function ScheduleGenerator({ timetableData }: ScheduleGeneratorProps) {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [newDeadline, setNewDeadline] = useState<Deadline>({
    title: "",
    dueDate: "",
    estimatedHours: 2,
    details: "",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);

  const addDeadline = () => {
    if (newDeadline.title && newDeadline.dueDate) {
      setDeadlines([...deadlines, newDeadline]);
      setNewDeadline({
        title: "",
        dueDate: "",
        estimatedHours: 2,
        details: "",
      });
    }
  };

  const removeDeadline = (index: number) => {
    setDeadlines(deadlines.filter((_, i) => i !== index));
  };

  const generatePlan = async () => {
    if (deadlines.length === 0) return;

    setIsGenerating(true);
    try {
      const response = await fetch(
        "http://localhost:5000/api/schedule/generate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            timetable: timetableData,
            deadlines,
            lifestyle: { sleepHours: 8, lunchDuration: 60, dinnerDuration: 60 },
            studyMode: "balanced",
            hardLimits: { noAfter23: false, noSundays: false },
          }),
        }
      );

      const data = await response.json();
      setGeneratedPlan(data);
    } catch (error) {
      console.error("Failed to generate plan:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Add Deadline Form */}
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Task name (e.g., Math Assignment)"
          value={newDeadline.title}
          onChange={(e) =>
            setNewDeadline({ ...newDeadline, title: e.target.value })
          }
          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />

        <div className="grid grid-cols-2 gap-3">
          <input
            type="date"
            value={newDeadline.dueDate}
            onChange={(e) =>
              setNewDeadline({ ...newDeadline, dueDate: e.target.value })
            }
            className="p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />

          <input
            type="number"
            placeholder="Hours needed"
            value={newDeadline.estimatedHours}
            onChange={(e) =>
              setNewDeadline({
                ...newDeadline,
                estimatedHours: Number(e.target.value),
              })
            }
            className="p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            min="1"
          />
        </div>

        <button
          onClick={addDeadline}
          disabled={!newDeadline.title || !newDeadline.dueDate}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Deadline
        </button>
      </div>

      {/* Deadlines List */}
      {deadlines.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-700">
            Your Deadlines ({deadlines.length})
          </h3>
          {deadlines.map((deadline, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200"
            >
              <div className="flex-1">
                <div className="font-semibold text-sm text-slate-900">
                  {deadline.title}
                </div>
                <div className="text-xs text-slate-600">
                  Due: {deadline.dueDate} • {deadline.estimatedHours}h needed
                </div>
              </div>
              <button
                onClick={() => removeDeadline(idx)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Generate Button */}
      {deadlines.length > 0 && (
        <button
          onClick={generatePlan}
          disabled={isGenerating}
          className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-slate-300 disabled:to-slate-400 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 text-lg"
        >
          {isGenerating ? (
            <>
              <Sparkles className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Study Plan
            </>
          )}
        </button>
      )}

      {/* Generated Plan */}
      {generatedPlan && (
        <div className="space-y-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-lg font-bold text-green-900">
            📅 Your Study Plan
          </h3>

          {generatedPlan.workloadAnalysis && (
            <div className="p-3 bg-white rounded-lg">
              <div className="text-sm text-slate-600">Workload Score</div>
              <div className="text-2xl font-bold text-slate-900">
                {generatedPlan.workloadAnalysis.score}/10
              </div>
              {generatedPlan.workloadAnalysis.warning && (
                <div className="text-xs text-orange-600 mt-1">
                  {generatedPlan.workloadAnalysis.warning}
                </div>
              )}
            </div>
          )}

          {generatedPlan.plan?.map((dayPlan: any, idx: number) => (
            <div key={idx} className="space-y-2">
              <h4 className="font-semibold text-slate-900">{dayPlan.date}</h4>
              <div className="space-y-1">
                {dayPlan.tasks?.map((task: any, taskIdx: number) => (
                  <div key={taskIdx} className="p-2 bg-white rounded text-sm">
                    <span className="font-medium text-blue-700">
                      {task.time}
                    </span>
                    <span className="text-slate-700"> • {task.activity}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
