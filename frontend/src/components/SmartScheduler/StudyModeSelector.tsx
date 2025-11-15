import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Zap } from 'lucide-react';
import { StudyMode, LifestylePrefs } from './ScheduleGeneratorTab';

interface StudyModeSelectorProps {
  studyMode: StudyMode;
  onStudyModeChange: (mode: StudyMode) => void;
  onLifestyleUpdate: (lifestyle: LifestylePrefs) => void;
}

const STUDY_MODES = {
  relaxed: {
    label: 'Relaxed',
    description: 'Balanced approach with plenty of rest',
    icon: '😌',
    color: 'bg-green-100 text-green-700 border-green-300',
    presets: { sleepHours: 8, lunchDuration: 60, dinnerDuration: 60 },
  },
  normal: {
    label: 'Normal',
    description: 'Standard study pace for regular workload',
    icon: '📚',
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    presets: { sleepHours: 7, lunchDuration: 45, dinnerDuration: 45 },
  },
  sprint: {
    label: 'Sprint',
    description: 'Intensive mode for deadline crunch',
    icon: '🔥',
    color: 'bg-red-100 text-red-700 border-red-300',
    presets: { sleepHours: 6, lunchDuration: 30, dinnerDuration: 30 },
  },
};

export function StudyModeSelector({
  studyMode,
  onStudyModeChange,
  onLifestyleUpdate,
}: StudyModeSelectorProps) {
  const handleModeChange = (mode: StudyMode) => {
    onStudyModeChange(mode);
    onLifestyleUpdate(STUDY_MODES[mode].presets);
  };

  return (
    <Card className="border-violet-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-violet-600" />
          Study Mode
        </CardTitle>
        <CardDescription>
          Choose your study intensity level - presets will auto-adjust sleep and meal times
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="study-mode">Mode Selection</Label>
          <Select value={studyMode} onValueChange={handleModeChange}>
            <SelectTrigger id="study-mode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(STUDY_MODES).map(([key, mode]) => (
                <SelectItem key={key} value={key}>
                  <span className="flex items-center gap-2">
                    <span>{mode.icon}</span>
                    <span>{mode.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Mode Cards */}
        <div className="space-y-2">
          {Object.entries(STUDY_MODES).map(([key, mode]) => (
            <div
              key={key}
              className={`rounded-lg p-3 border-2 transition-all cursor-pointer ${
                studyMode === key
                  ? mode.color
                  : 'bg-white border-slate-200 opacity-60 hover:opacity-100'
              }`}
              onClick={() => handleModeChange(key as StudyMode)}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{mode.icon}</span>
                <div className="flex-1">
                  <p className="font-medium">{mode.label}</p>
                  <p className="text-sm opacity-80 mt-1">{mode.description}</p>
                  <div className="flex gap-3 mt-2 text-xs">
                    <span>Sleep: {mode.presets.sleepHours}h</span>
                    <span>•</span>
                    <span>Meals: {mode.presets.lunchDuration + mode.presets.dinnerDuration}min</span>
                  </div>
                </div>
                {studyMode === key && (
                  <div className="w-5 h-5 rounded-full bg-current flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

