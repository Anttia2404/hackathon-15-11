// Mock AI scheduler that generates optimized study plans
import { Deadline, LifestylePrefs, StudyMode } from '../components/ScheduleGeneratorTab';

interface ScheduleInput {
  deadlines: Deadline[];
  lifestyle: LifestylePrefs;
  studyMode: StudyMode;
  timetableData: any[];
  hardLimits: {
    noAfter23: boolean;
    noSundays: boolean;
  };
}

export function generateAISchedule(input: ScheduleInput) {
  const { deadlines, lifestyle, studyMode, timetableData, hardLimits } = input;

  // Sort deadlines by due date
  const sortedDeadlines = [...deadlines].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  // Calculate available study time per day
  const sleepTime = lifestyle.sleepHours;
  const mealTime = (lifestyle.lunchDuration + lifestyle.dinnerDuration) / 60;
  const classTime = timetableData.length * 2; // Approximate
  const availableHours = 24 - sleepTime - mealTime - classTime;

  // Generate today's plan
  const today = generateDayPlan(
    sortedDeadlines,
    lifestyle,
    timetableData,
    hardLimits,
    'today',
    availableHours
  );

  // Generate tomorrow's plan
  const tomorrow = generateDayPlan(
    sortedDeadlines,
    lifestyle,
    timetableData,
    hardLimits,
    'tomorrow',
    availableHours
  );

  // Generate AI summary
  const urgentCount = sortedDeadlines.filter((d) => {
    const daysUntil = Math.ceil(
      (new Date(d.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntil <= 3;
  }).length;

  let summary = '';
  if (studyMode === 'sprint') {
    summary = `🔥 Sprint mode activated! You have ${urgentCount} urgent deadline(s). I've optimized your schedule to maximize study time. Remember to take short breaks to maintain focus.`;
  } else if (studyMode === 'relaxed') {
    summary = `😌 Relaxed mode: Your schedule has plenty of buffer time. I've prioritized ${sortedDeadlines[0]?.title} while keeping your ${lifestyle.sleepHours}h sleep goal intact.`;
  } else {
    summary = `📚 Normal mode: Balanced schedule created for ${sortedDeadlines.length} deadline(s). Total study time: ~${Math.round(availableHours * 2)}h over 2 days.`;
  }

  return {
    today,
    tomorrow,
    summary,
  };
}

function generateDayPlan(
  deadlines: Deadline[],
  lifestyle: LifestylePrefs,
  timetable: any[],
  hardLimits: any,
  day: string,
  availableHours: number
): any[] {
  const plan: any[] = [];
  let currentTime = 7; // Start at 7 AM

  // Morning routine
  plan.push({
    id: `${day}-wake`,
    timeRange: '7:00 - 8:00',
    task: 'Wake up & Morning routine',
    category: 'break',
    duration: '1 hour',
  });

  currentTime = 8;

  // Breakfast
  plan.push({
    id: `${day}-breakfast`,
    timeRange: '8:00 - 8:30',
    task: 'Breakfast',
    category: 'meal',
    duration: '30 min',
  });

  currentTime = 8.5;

  // Morning study session (most productive time)
  if (deadlines.length > 0) {
    const firstDeadline = deadlines[0];
    plan.push({
      id: `${day}-study-1`,
      timeRange: '8:30 - 11:00',
      task: `Study: ${firstDeadline.title}`,
      category: 'study',
      duration: '2.5 hours',
      notes: `Focus on high-priority items. Due: ${new Date(firstDeadline.dueDate).toLocaleDateString()}`,
    });

    currentTime = 11;
  }

  // Short break
  plan.push({
    id: `${day}-break-1`,
    timeRange: '11:00 - 11:15',
    task: 'Coffee break',
    category: 'break',
    duration: '15 min',
    notes: 'Stretch and hydrate',
  });

  // Pre-lunch study
  if (deadlines.length > 1) {
    const secondDeadline = deadlines[1];
    plan.push({
      id: `${day}-study-2`,
      timeRange: '11:15 - 13:00',
      task: `Work on: ${secondDeadline.title}`,
      category: 'study',
      duration: '1.75 hours',
    });
  }

  // Lunch
  const lunchDuration = lifestyle.lunchDuration;
  const lunchEnd = 13 + lunchDuration / 60;
  plan.push({
    id: `${day}-lunch`,
    timeRange: `13:00 - ${Math.floor(lunchEnd)}:${String(Math.round((lunchEnd % 1) * 60)).padStart(2, '0')}`,
    task: 'Lunch break',
    category: 'meal',
    duration: `${lunchDuration} min`,
  });

  currentTime = lunchEnd;

  // Afternoon class (if in timetable)
  if (timetable.length > 0) {
    plan.push({
      id: `${day}-class`,
      timeRange: '15:00 - 17:00',
      task: timetable[0]?.title || 'Scheduled class',
      category: 'class',
      duration: '2 hours',
      notes: timetable[0]?.location,
    });
  }

  // Evening study session
  if (deadlines.length > 0) {
    const deadline = deadlines[Math.min(2, deadlines.length - 1)];
    plan.push({
      id: `${day}-study-3`,
      timeRange: '17:30 - 19:30',
      task: `Continue: ${deadline.title}`,
      category: 'study',
      duration: '2 hours',
      notes: 'Review and practice problems',
    });
  }

  // Dinner
  const dinnerDuration = lifestyle.dinnerDuration;
  plan.push({
    id: `${day}-dinner`,
    timeRange: `19:30 - 20:${String(dinnerDuration).padStart(2, '0')}`,
    task: 'Dinner',
    category: 'meal',
    duration: `${dinnerDuration} min`,
  });

  // Evening review session (if not past hard limit)
  if (!hardLimits.noAfter23) {
    plan.push({
      id: `${day}-study-4`,
      timeRange: '20:30 - 22:00',
      task: 'Review and light studying',
      category: 'study',
      duration: '1.5 hours',
      notes: 'Less intensive tasks, review notes',
    });
  }

  // Wind down
  plan.push({
    id: `${day}-winddown`,
    timeRange: hardLimits.noAfter23 ? '21:00 - 22:00' : '22:00 - 22:30',
    task: 'Wind down & prepare for bed',
    category: 'break',
    duration: hardLimits.noAfter23 ? '1 hour' : '30 min',
    notes: 'No screens, relaxation time',
  });

  // Sleep
  const sleepStart = hardLimits.noAfter23 ? 22 : 22.5;
  const sleepEnd = sleepStart + lifestyle.sleepHours;
  plan.push({
    id: `${day}-sleep`,
    timeRange: `${Math.floor(sleepStart)}:${String(Math.round((sleepStart % 1) * 60)).padStart(2, '0')} - ${Math.floor(sleepEnd)}:${String(Math.round((sleepEnd % 1) * 60)).padStart(2, '0')}`,
    task: 'Sleep',
    category: 'sleep',
    duration: `${lifestyle.sleepHours} hours`,
    notes: `Target: ${lifestyle.sleepHours}h for optimal performance`,
  });

  return plan;
}
