import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { CalendarDays, Clock, Sparkles, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";

interface ActionItem {
  id: string;
  timeRange: string;
  task: string;
  category: "study" | "break" | "meal" | "sleep" | "class";
  duration: string;
  notes?: string;
  completed?: boolean;
}

interface WeekPlan {
  weekNumber: number;
  startDate: string;
  endDate: string;
  days: {
    [key: string]: ActionItem[];
  };
}

interface ActionPlanDisplayProps {
  plan: {
    weeks?: WeekPlan[];
    today?: ActionItem[];
    tomorrow?: ActionItem[];
    summary?: string;
  } | null;
  isGenerating: boolean;
}

const CATEGORY_STYLES = {
  study: "bg-violet-100 text-violet-700 border-violet-300",
  break: "bg-green-100 text-green-700 border-green-300",
  meal: "bg-orange-100 text-orange-700 border-orange-300",
  sleep: "bg-blue-100 text-blue-700 border-blue-300",
  class: "bg-slate-100 text-slate-700 border-slate-300",
};

const CATEGORY_ICONS = {
  study: "📝",
  break: "☕",
  meal: "🍽️",
  sleep: "😴",
  class: "🎓",
};

export function ActionPlanDisplay({
  plan,
  isGenerating,
}: ActionPlanDisplayProps) {
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);

  const toggleComplete = (id: string) => {
    const newCompleted = new Set(completedItems);
    if (newCompleted.has(id)) {
      newCompleted.delete(id);
    } else {
      newCompleted.add(id);
    }
    setCompletedItems(newCompleted);
  };

  if (isGenerating) {
    return (
      <Card className="border-violet-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-600 animate-pulse" />
            Generating Your Plan...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-16 bg-slate-100 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!plan) {
    return (
      <Card className="border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-slate-600" />
            Your AI Study Plan
          </CardTitle>
          <CardDescription>
            Configure your deadlines and preferences, then generate your
            personalized study plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-violet-100 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-violet-600" />
            </div>
            <p className="text-slate-600">
              Waiting for AI to generate your optimized schedule...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Check if we have multi-week plan
  if (plan.weeks && plan.weeks.length > 0) {
    const currentWeek = plan.weeks[currentWeekIndex];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    return (
      <div className="space-y-6">
        {/* Summary Card */}
        {plan.summary && (
          <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-blue-50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-violet-900">
                <Sparkles className="w-5 h-5" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-violet-900 text-sm">{plan.summary}</p>
            </CardContent>
          </Card>
        )}

        {/* Week Navigation */}
        <Card className="border-blue-200 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-blue-600" />
                  Week {currentWeek.weekNumber} Schedule
                </CardTitle>
                <CardDescription className="mt-1">
                  {currentWeek.startDate} - {currentWeek.endDate}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentWeekIndex(Math.max(0, currentWeekIndex - 1))}
                  disabled={currentWeekIndex === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Badge className="bg-blue-100 text-blue-700 border-blue-300 px-3">
                  {currentWeekIndex + 1} / {plan.weeks.length}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentWeekIndex(Math.min(plan.weeks!.length - 1, currentWeekIndex + 1))}
                  disabled={currentWeekIndex === plan.weeks.length - 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dayNames.map((dayName) => {
                const dayTasks = currentWeek.days[dayName] || [];
                if (dayTasks.length === 0) return null;
                
                const dayCompleted = dayTasks.filter((item) =>
                  completedItems.has(item.id)
                ).length;

                return (
                  <div key={dayName} className="border-l-4 border-blue-400 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-slate-700">{dayName}</h3>
                      <Badge variant="outline" className="text-xs">
                        {dayCompleted}/{dayTasks.length} done
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {dayTasks.map((item) => (
                        <ActionItemCard
                          key={item.id}
                          item={item}
                          isCompleted={completedItems.has(item.id)}
                          onToggleComplete={() => toggleComplete(item.id)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fallback to old 2-day format
  const todayCompleted = plan.today?.filter((item) =>
    completedItems.has(item.id)
  ).length || 0;
  const tomorrowCompleted = plan.tomorrow?.filter((item) =>
    completedItems.has(item.id)
  ).length || 0;

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      {plan.summary && (
        <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-blue-50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-violet-900">
              <Sparkles className="w-5 h-5" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-violet-900 text-sm">{plan.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Today's Plan */}
      {plan.today && plan.today.length > 0 && (
        <Card className="border-blue-200 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-blue-600" />
                  Today's Action Plan
                </CardTitle>
                <CardDescription className="mt-1">
                  {plan.today.length} tasks scheduled
                </CardDescription>
              </div>
              {plan.today.length > 0 && (
                <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                  {todayCompleted}/{plan.today.length} done
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {plan.today.map((item) => (
                <ActionItemCard
                  key={item.id}
                  item={item}
                  isCompleted={completedItems.has(item.id)}
                  onToggleComplete={() => toggleComplete(item.id)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tomorrow's Plan */}
      {plan.tomorrow && plan.tomorrow.length > 0 && (
        <Card className="border-violet-200 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-violet-600" />
                  Tomorrow's Action Plan
                </CardTitle>
                <CardDescription className="mt-1">
                  {plan.tomorrow.length} tasks scheduled
                </CardDescription>
              </div>
              {plan.tomorrow.length > 0 && (
                <Badge className="bg-violet-100 text-violet-700 border-violet-300">
                  {tomorrowCompleted}/{plan.tomorrow.length} done
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {plan.tomorrow.map((item) => (
                <ActionItemCard
                  key={item.id}
                  item={item}
                  isCompleted={completedItems.has(item.id)}
                  onToggleComplete={() => toggleComplete(item.id)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ActionItemCard({
  item,
  isCompleted,
  onToggleComplete,
}: {
  item: ActionItem;
  isCompleted: boolean;
  onToggleComplete: () => void;
}) {
  return (
    <div
      className={`rounded-lg border-2 p-3 transition-all ${
        isCompleted
          ? "bg-slate-50 border-slate-300 opacity-60"
          : `${CATEGORY_STYLES[item.category]} border-2`
      }`}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={isCompleted}
          onCheckedChange={onToggleComplete}
          className="mt-1"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{CATEGORY_ICONS[item.category]}</span>
            <p
              className={`${isCompleted ? "line-through text-slate-500" : ""}`}
            >
              {item.task}
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1 text-slate-600">
              <Clock className="w-3 h-3" />
              {item.timeRange}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600">{item.duration}</span>
          </div>
          {item.notes && (
            <p className="text-xs text-slate-600 mt-1 italic">{item.notes}</p>
          )}
        </div>
        {isCompleted && (
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
        )}
      </div>
    </div>
  );
}
