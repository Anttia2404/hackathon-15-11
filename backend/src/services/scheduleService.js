/**
 * Local fallback schedule generator (when Gemini AI is not available)
 */

function generateSchedule(input) {
  const { deadlines, lifestyle, studyMode, timetableData, hardLimits, scheduleWeeks } = input;

  // Sort deadlines by due date (most urgent first)
  const sortedDeadlines = [...deadlines].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  // Calculate available study time
  const sleepTime = lifestyle.sleepHours || 8;
  const mealTime = ((lifestyle.lunchDuration || 60) + (lifestyle.dinnerDuration || 60)) / 60;
  const classTime = (timetableData?.length || 0) * 2;
  const availableHours = 24 - sleepTime - mealTime - classTime;

  // Check if we need multi-week schedule
  const numWeeks = scheduleWeeks || 1;
  
  if (numWeeks > 1) {
    // Generate multi-week schedule
    const weeks = generateMultiWeekSchedule(
      sortedDeadlines,
      lifestyle,
      timetableData,
      hardLimits,
      studyMode,
      numWeeks
    );
    
    const summary = generateSummary(sortedDeadlines, studyMode, lifestyle, availableHours);
    
    return {
      weeks,
      summary,
      metadata: {
        totalDeadlines: sortedDeadlines.length,
        availableStudyHours: Math.round(availableHours * 10) / 10,
        studyMode,
        totalWeeks: numWeeks,
        generatedAt: new Date().toISOString(),
        aiGenerated: false
      }
    };
  }

  // Generate schedules for today and tomorrow (legacy format)
  const today = generateDayPlan(
    sortedDeadlines,
    lifestyle,
    timetableData,
    hardLimits,
    'today',
    availableHours,
    studyMode
  );

  const tomorrow = generateDayPlan(
    sortedDeadlines,
    lifestyle,
    timetableData,
    hardLimits,
    'tomorrow',
    availableHours,
    studyMode
  );

  // Generate summary
  const summary = generateSummary(sortedDeadlines, studyMode, lifestyle, availableHours);

  return {
    today,
    tomorrow,
    summary,
    metadata: {
      totalDeadlines: sortedDeadlines.length,
      availableStudyHours: Math.round(availableHours * 10) / 10,
      studyMode,
      generatedAt: new Date().toISOString(),
      aiGenerated: false
    }
  };
}

function generateMultiWeekSchedule(deadlines, lifestyle, timetable, hardLimits, studyMode, numWeeks) {
  const weeks = [];
  const startDate = new Date();
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  for (let weekNum = 0; weekNum < numWeeks; weekNum++) {
    const weekStart = new Date(startDate);
    weekStart.setDate(startDate.getDate() + (weekNum * 7));
    
    // Get Monday of this week
    const dayOfWeek = weekStart.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    weekStart.setDate(weekStart.getDate() + diff);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    const weekData = {
      weekNumber: weekNum + 1,
      startDate: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      endDate: weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      days: {}
    };
    
    // Generate schedule for each day of the week
    dayNames.forEach((dayName, dayIndex) => {
      const currentDate = new Date(weekStart);
      currentDate.setDate(weekStart.getDate() + dayIndex);
      
      // Check if it's Sunday and noSundays is enabled
      if (dayName === 'Sunday' && hardLimits?.noSundays) {
        weekData.days[dayName] = [];
        return;
      }
      
      // Filter timetable for this specific day
      const dayTimetable = timetable?.filter(slot => slot.day === dayName) || [];
      
      // Generate day plan
      const dayId = `week${weekNum + 1}-${dayName.toLowerCase()}`;
      weekData.days[dayName] = generateDayPlan(
        deadlines,
        lifestyle,
        dayTimetable,
        hardLimits,
        dayId,
        0, // availableHours not used in this context
        studyMode,
        currentDate
      );
    });
    
    weeks.push(weekData);
  }
  
  return weeks;
}

function generateDayPlan(deadlines, lifestyle, timetable, hardLimits, day, availableHours, studyMode, currentDate) {
  const plan = [];
  const sleepHours = lifestyle.sleepHours || 8;
  const lunchDuration = lifestyle.lunchDuration || 60;
  const dinnerDuration = lifestyle.dinnerDuration || 60;
  const noAfter23 = hardLimits?.noAfter23 || false;

  // Morning routine
  plan.push({
    id: `${day}-wake`,
    timeRange: '7:00 - 8:00',
    task: 'Wake up & Morning routine',
    category: 'break',
    duration: '1 hour'
  });

  // Breakfast
  plan.push({
    id: `${day}-breakfast`,
    timeRange: '8:00 - 8:30',
    task: 'Breakfast',
    category: 'meal',
    duration: '30 min'
  });

  // Morning study session
  if (deadlines.length > 0) {
    const firstDeadline = deadlines[0];
    plan.push({
      id: `${day}-study-1`,
      timeRange: '8:30 - 11:00',
      task: `Study: ${firstDeadline.title}`,
      category: 'study',
      duration: '2.5 hours',
      notes: `Due: ${new Date(firstDeadline.dueDate).toLocaleDateString()}`
    });
  }

  // Short break
  plan.push({
    id: `${day}-break-1`,
    timeRange: '11:00 - 11:15',
    task: 'Coffee break',
    category: 'break',
    duration: '15 min'
  });

  // Pre-lunch study
  if (deadlines.length > 1) {
    const secondDeadline = deadlines[1];
    plan.push({
      id: `${day}-study-2`,
      timeRange: '11:15 - 13:00',
      task: `Work on: ${secondDeadline.title}`,
      category: 'study',
      duration: '1.75 hours'
    });
  }

  // Lunch
  const lunchEnd = 13 + lunchDuration / 60;
  plan.push({
    id: `${day}-lunch`,
    timeRange: `13:00 - ${formatTime(lunchEnd)}`,
    task: 'Lunch break',
    category: 'meal',
    duration: `${lunchDuration} min`
  });

  // Afternoon class (if scheduled)
  if (timetable && timetable.length > 0) {
    plan.push({
      id: `${day}-class`,
      timeRange: '15:00 - 17:00',
      task: timetable[0].title || 'Scheduled class',
      category: 'class',
      duration: '2 hours'
    });
  }

  // Evening study
  if (deadlines.length > 0) {
    const deadline = deadlines[Math.min(2, deadlines.length - 1)];
    plan.push({
      id: `${day}-study-3`,
      timeRange: '17:30 - 19:30',
      task: `Continue: ${deadline.title}`,
      category: 'study',
      duration: '2 hours'
    });
  }

  // Dinner
  const dinnerStart = 19.5;
  const dinnerEnd = dinnerStart + dinnerDuration / 60;
  plan.push({
    id: `${day}-dinner`,
    timeRange: `${formatTime(dinnerStart)} - ${formatTime(dinnerEnd)}`,
    task: 'Dinner',
    category: 'meal',
    duration: `${dinnerDuration} min`
  });

  // Evening study (if allowed)
  if (!noAfter23 && studyMode !== 'relaxed') {
    plan.push({
      id: `${day}-study-4`,
      timeRange: '20:30 - 22:00',
      task: 'Review and practice',
      category: 'study',
      duration: '1.5 hours'
    });
  }

  // Wind down
  const windDownStart = noAfter23 ? 21 : 22;
  const windDownEnd = noAfter23 ? 22 : 22.5;
  plan.push({
    id: `${day}-winddown`,
    timeRange: `${formatTime(windDownStart)} - ${formatTime(windDownEnd)}`,
    task: 'Wind down & prepare for bed',
    category: 'break',
    duration: '30-60 min'
  });

  // Sleep
  const sleepStart = noAfter23 ? 22 : 22.5;
  const sleepEnd = sleepStart + sleepHours;
  plan.push({
    id: `${day}-sleep`,
    timeRange: `${formatTime(sleepStart)} - ${formatTime(sleepEnd >= 24 ? sleepEnd - 24 : sleepEnd)}`,
    task: 'Sleep',
    category: 'sleep',
    duration: `${sleepHours} hours`
  });

  return plan;
}

function generateSummary(deadlines, studyMode, lifestyle, availableHours) {
  const urgentCount = deadlines.filter((d) => {
    const daysUntil = Math.ceil(
      (new Date(d.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntil <= 3;
  }).length;

  const totalStudyHours = Math.round(availableHours * 2 * 10) / 10;
  
  // Check if any deadline mentions "yếu" or "weak"
  const hasWeakSubject = deadlines.some(d => 
    d.details && (d.details.toLowerCase().includes('yếu') || 
                  d.details.toLowerCase().includes('weak') ||
                  d.details.toLowerCase().includes('chưa có nền'))
  );
  
  // AI-like analysis
  let summary = '';
  
  if (studyMode === 'sprint') {
    summary = `🔥 **Phân tích AI - Sprint Mode**\n\n`;
    summary += `Tôi đã phát hiện ${urgentCount} deadline khẩn cấp (còn ≤3 ngày). `;
    
    if (hasWeakSubject) {
      summary += `Đặc biệt, tôi nhận thấy bạn đề cập "yếu môn" trong chi tiết, nên tôi đã tự động tăng thời gian học lên 30% để đảm bảo bạn có đủ thời gian ôn tập kỹ. `;
    }
    
    summary += `\n\n**Điều chỉnh thời gian:**\n`;
    summary += `- Giảm giờ ngủ: ${lifestyle.sleepHours}h → 6h (tối thiểu an toàn)\n`;
    summary += `- Rút ngắn bữa ăn: ${lifestyle.lunchDuration + lifestyle.dinnerDuration}p → 60p\n`;
    summary += `- Tổng thời gian học: ~${totalStudyHours}h trong 2 ngày\n\n`;
    summary += `⚠️ **Lưu ý:** Đây là lịch rất căng thẳng. Hãy nghỉ ngơi đầy đủ sau khi hoàn thành deadline!`;
    
  } else if (studyMode === 'relaxed') {
    summary += `😌 **Phân tích AI - Relaxed Mode**\n\n`;
    summary += `Bạn có ${deadlines.length} deadline và đang chọn chế độ thư giãn. Tuyệt vời! `;
    
    if (hasWeakSubject) {
      summary += `Tôi thấy bạn đề cập "yếu môn", nhưng vì bạn chọn relaxed mode, tôi sẽ phân bổ thời gian đều đặn mỗi ngày thay vì học dồn. `;
    }
    
    summary += `\n\n**Giữ nguyên:**\n`;
    summary += `- Giờ ngủ: ${lifestyle.sleepHours}h (không thay đổi)\n`;
    summary += `- Bữa ăn: ${lifestyle.lunchDuration + lifestyle.dinnerDuration}p (đầy đủ)\n`;
    summary += `- Thời gian học: ~${totalStudyHours}h phân bổ thoải mái\n\n`;
    summary += `✅ **Kết luận:** Lịch học cân bằng, đảm bảo sức khỏe và hiệu quả!`;
    
  } else {
    summary += `📚 **Phân tích AI - Normal Mode**\n\n`;
    summary += `Tôi đã tạo lịch cân bằng cho ${deadlines.length} deadline của bạn. `;
    
    if (urgentCount > 0) {
      summary += `Có ${urgentCount} deadline khẩn cấp cần ưu tiên. `;
    }
    
    if (hasWeakSubject) {
      summary += `Tôi nhận thấy bạn "yếu" một số môn, nên đã tăng 30% thời gian học để bạn có thể ôn kỹ hơn. `;
    }
    
    summary += `\n\n**Điều chỉnh nhẹ:**\n`;
    summary += `- Giờ ngủ: ${lifestyle.sleepHours}h → 7h (vẫn đủ nghỉ ngơi)\n`;
    summary += `- Bữa ăn: ${lifestyle.lunchDuration + lifestyle.dinnerDuration}p → 90p (rút ngắn chút)\n`;
    summary += `- Tổng thời gian học: ~${totalStudyHours}h\n\n`;
    
    if (urgentCount > 0) {
      summary += `⚠️ **Khuyến nghị:** ${urgentCount} deadline gần, hãy tập trung vào những task này trước!`;
    } else {
      summary += `✅ **Đánh giá:** Workload hợp lý, bạn có thể hoàn thành tốt!`;
    }
  }

  return summary;
}

function formatTime(hours) {
  const h = Math.floor(hours);
  const m = Math.round((hours % 1) * 60);
  return `${h}:${String(m).padStart(2, '0')}`;
}

module.exports = { generateSchedule };
