import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Moon, Utensils } from 'lucide-react';
import { LifestylePrefs } from './ScheduleGeneratorTab';

interface LifestyleSettingsProps {
  lifestyle: LifestylePrefs;
  onLifestyleChange: (lifestyle: LifestylePrefs) => void;
  studyMode: string;
}

export function LifestyleSettings({
  lifestyle,
  onLifestyleChange,
  studyMode,
}: LifestyleSettingsProps) {
  return (
    <Card className="border-blue-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Moon className="w-5 h-5 text-blue-600" />
          Sleep & Meal Settings
        </CardTitle>
        <CardDescription>
          AI may negotiate (adjust) these durations depending on deadline urgency
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="sleep" className="flex items-center gap-2">
            <Moon className="w-4 h-4" />
            Sleep Hours per Day
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="sleep"
              type="number"
              value={lifestyle.sleepHours}
              onChange={(e) =>
                onLifestyleChange({
                  ...lifestyle,
                  sleepHours: parseFloat(e.target.value),
                })
              }
              min="4"
              max="10"
              step="0.5"
              className="w-24"
            />
            <span className="text-slate-600">hours</span>
            {studyMode === 'sprint' && lifestyle.sleepHours > 6 && (
              <span className="text-amber-600 text-sm ml-auto">
                ⚠️ Sprint mode suggests ≤6h
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="lunch" className="flex items-center gap-2">
              <Utensils className="w-4 h-4" />
              Lunch Duration
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="lunch"
                type="number"
                value={lifestyle.lunchDuration}
                onChange={(e) =>
                  onLifestyleChange({
                    ...lifestyle,
                    lunchDuration: parseInt(e.target.value),
                  })
                }
                min="15"
                max="120"
                step="5"
                className="w-20"
              />
              <span className="text-slate-600 text-sm">min</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dinner" className="flex items-center gap-2">
              <Utensils className="w-4 h-4" />
              Dinner Duration
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="dinner"
                type="number"
                value={lifestyle.dinnerDuration}
                onChange={(e) =>
                  onLifestyleChange({
                    ...lifestyle,
                    dinnerDuration: parseInt(e.target.value),
                  })
                }
                min="15"
                max="120"
                step="5"
                className="w-20"
              />
              <span className="text-slate-600 text-sm">min</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-3 mt-4">
          <p className="text-blue-900 text-sm">
            💡 Current total: {lifestyle.sleepHours}h sleep + 
            {' '}{Math.round((lifestyle.lunchDuration + lifestyle.dinnerDuration) / 60 * 10) / 10}h meals
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

