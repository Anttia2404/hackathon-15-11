import { useState } from 'react';
import { DeadlineForm } from './DeadlineForm';
import { LifestyleSettings } from './LifestyleSettings';
import { StudyModeSelector } from './StudyModeSelector';
import { ActionPlanDisplay } from './ActionPlanDisplay';
import { Button } from './ui/button';
import { Sparkles } from 'lucide-react';
import { generateAISchedule } from '../utils/aiScheduler';

export interface Deadline {
  id: string;
  title: string;
  dueDate: string;
  estimatedHours: number;
  details: string;
}

export interface LifestylePrefs {
  sleepHours: number;
  lunchDuration: number;
  dinnerDuration: number;
}

export type StudyMode = 'relaxed' | 'normal' | 'sprint';

interface ScheduleGeneratorTabProps {
  timetableData: any[];
  hardLimits: {
    noAfter23: boolean;
    noSundays: boolean;
  };
}

export function ScheduleGeneratorTab({ timetableData, hardLimits }: ScheduleGeneratorTabProps) {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [lifestyle, setLifestyle] = useState<LifestylePrefs>({
    sleepHours: 7,
    lunchDuration: 45,
    dinnerDuration: 45,
  });
  const [studyMode, setStudyMode] = useState<StudyMode>('normal');
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const plan = generateAISchedule({
        deadlines,
        lifestyle,
        studyMode,
        timetableData,
        hardLimits,
      });
      setGeneratedPlan(plan);
      setIsGenerating(false);
    }, 2000);
  };

  const addDeadline = (deadline: Omit<Deadline, 'id'>) => {
    const newDeadline = {
      ...deadline,
      id: Date.now().toString(),
    };
    setDeadlines([...deadlines, newDeadline]);
  };

  const removeDeadline = (id: string) => {
    setDeadlines(deadlines.filter((d) => d.id !== id));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Section - Input Controls */}
      <div className="space-y-6">
        <DeadlineForm
          deadlines={deadlines}
          onAddDeadline={addDeadline}
          onRemoveDeadline={removeDeadline}
        />

        <LifestyleSettings
          lifestyle={lifestyle}
          onLifestyleChange={setLifestyle}
          studyMode={studyMode}
        />

        <StudyModeSelector
          studyMode={studyMode}
          onStudyModeChange={setStudyMode}
          onLifestyleUpdate={setLifestyle}
        />

        <Button
          onClick={handleGeneratePlan}
          disabled={deadlines.length === 0 || isGenerating}
          className="w-full h-14 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700"
          size="lg"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          {isGenerating ? 'Generating AI Study Plan...' : 'Generate AI Study Plan'}
        </Button>

        {deadlines.length === 0 && (
          <p className="text-slate-500 text-sm text-center">
            Add at least one deadline to generate a study plan
          </p>
        )}
      </div>

      {/* Right Section - AI Results */}
      <div className="lg:sticky lg:top-8 lg:self-start">
        <ActionPlanDisplay plan={generatedPlan} isGenerating={isGenerating} />
      </div>
    </div>
  );
}

