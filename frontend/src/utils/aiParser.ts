// Mock AI parser for timetable text
export function parseTimetableWithAI(rawText: string) {
  const lines = rawText.split('\n').filter((line) => line.trim());
  const schedule: any[] = [];

  const dayPattern = /(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i;
  const timePattern = /(\d{1,2}):?(\d{2})?\s*-\s*(\d{1,2}):?(\d{2})?/;

  lines.forEach((line) => {
    const dayMatch = line.match(dayPattern);
    const timeMatch = line.match(timePattern);

    if (dayMatch && timeMatch) {
      const day = dayMatch[1];
      const startHour = timeMatch[1].padStart(2, '0');
      const startMin = timeMatch[2] || '00';
      const endHour = timeMatch[3].padStart(2, '0');
      const endMin = timeMatch[4] || '00';

      // Extract course title (text between time and optional dash/location)
      const titleMatch = line
        .replace(dayMatch[0], '')
        .replace(timeMatch[0], '')
        .trim()
        .split(/[-–]|Room|Building/)[0]
        .trim();

      // Extract location if present
      const locationMatch = line.match(/(?:Room|Building)\s+([A-Z0-9]+)/i);

      schedule.push({
        day,
        startTime: `${startHour}:${startMin}`,
        endTime: `${endHour}:${endMin}`,
        title: titleMatch || 'Class',
        location: locationMatch ? locationMatch[0] : null,
      });
    }
  });

  // If no valid entries found, create some sample data
  if (schedule.length === 0) {
    return [
      {
        day: 'Monday',
        startTime: '09:00',
        endTime: '11:00',
        title: 'Sample Class',
        location: 'Room 101',
      },
    ];
  }

  return schedule;
}

