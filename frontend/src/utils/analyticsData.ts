// Generate study analytics data for charts - 7 DAYS MOCK DATA
export interface StudyDayData {
  day: string;
  score: number;
  studyHours: number;
  assignmentCompletion: number;
  label: string;
}

export const generate7DaysAnalytics = (): StudyDayData[] => {
  return [
    { day: 'Ngày 1', score: 30, studyHours: 1.5, assignmentCompletion: 20, label: 'Mới bắt đầu' },
    { day: 'Ngày 2', score: 42, studyHours: 2.0, assignmentCompletion: 35, label: 'Đang làm quen' },
    { day: 'Ngày 3', score: 55, studyHours: 2.5, assignmentCompletion: 50, label: 'Tiến bộ' },
    { day: 'Ngày 4', score: 65, studyHours: 3.0, assignmentCompletion: 60, label: 'Khá tốt' },
    { day: 'Ngày 5', score: 72, studyHours: 3.5, assignmentCompletion: 70, label: 'Tốt' },
    { day: 'Ngày 6', score: 78, studyHours: 4.0, assignmentCompletion: 75, label: 'Rất tốt' },
    { day: 'Ngày 7', score: 85, studyHours: 4.5, assignmentCompletion: 80, label: 'Xuất sắc!' },
  ];
};

export const getImprovementPercentage = (): number => {
  const data = generate7DaysAnalytics();
  const firstDay = data[0].score;
  const lastDay = data[data.length - 1].score;
  return Math.round(((lastDay - firstDay) / firstDay) * 100);
};

export const getStudyInsight = (): string => {
  return 'Bạn đã tăng 3h học/tuần, hoàn thành 80% bài tập';
};

export const getOptimalStudyTime = (): string => {
  return 'Bạn học hiệu quả nhất 20h-22h, thứ 3 & thứ 5';
};

export const getGoldenHourTags = () => {
  return ['Giờ vàng', 'Tránh giờ buồn ngủ'];
};
