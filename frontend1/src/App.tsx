import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ContextTab } from './components/ContextTab';
import { ScheduleGeneratorTab } from './components/ScheduleGeneratorTab';

export type TabType = 'context' | 'generator';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('context');
  const [timetableData, setTimetableData] = useState<any[]>([]);
  const [hardLimits, setHardLimits] = useState({
    noAfter23: false,
    noSundays: false,
  });

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">
          <header className="mb-8">
            <h1 className="text-slate-900 mb-2">AI Academic Advisor & Smart Scheduler</h1>
            <p className="text-slate-600">
              Your intelligent assistant for optimizing study schedules and managing academic deadlines
            </p>
          </header>

          {activeTab === 'context' && (
            <ContextTab
              timetableData={timetableData}
              setTimetableData={setTimetableData}
              hardLimits={hardLimits}
              setHardLimits={setHardLimits}
            />
          )}

          {activeTab === 'generator' && (
            <ScheduleGeneratorTab
              timetableData={timetableData}
              hardLimits={hardLimits}
            />
          )}
        </div>
      </main>
    </div>
  );
}
