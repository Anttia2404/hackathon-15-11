const express = require('express');
const router = express.Router();

// Import services
const { parseTimetableWithAI, generateStudyPlan } = require('../services/geminiService');
const { generateSchedule } = require('../services/scheduleService');

// POST /api/v1/schedule/parse-text - Parse timetable text with AI
router.post('/parse-text', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ 
        success: false,
        error: 'Text is required' 
      });
    }

    if (text.trim().length < 10) {
      return res.status(400).json({ 
        success: false,
        error: 'Text quá ngắn. Vui lòng nhập thời khóa biểu đầy đủ hơn.' 
      });
    }

    // Check if Gemini API key is configured
    const hasGeminiKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here';

    let result;
    
    if (hasGeminiKey) {
      try {
        result = await parseTimetableWithAI(text);
      } catch (aiError) {
        // If AI validation fails, return error with reason
        return res.status(400).json({ 
          success: false,
          error: aiError.message,
          suggestion: 'Vui lòng nhập theo định dạng: "Monday 8:00-10:00 Tên môn học - Phòng"'
        });
      }
    } else {
      // Fallback to local parser
      const { parseTimetableWithAI: localParser } = require('../utils/aiParser');
      result = { schedule: localParser(text) };
    }
    
    res.json({ 
      success: true,
      valid: true,
      schedule: result.schedule 
    });
  } catch (error) {
    console.error('Error parsing timetable:', error);
    res.status(500).json({ 
      success: false,
      error: 'Lỗi server',
      message: error.message 
    });
  }
});

// POST /api/v1/schedule/generate - Generate optimized study plan
router.post('/generate', async (req, res) => {
  try {
    const { deadlines, lifestyle, studyMode, timetableData, hardLimits, useAI, scheduleWeeks } = req.body;

    // Validate input
    if (!deadlines || !Array.isArray(deadlines)) {
      return res.status(400).json({ 
        success: false,
        error: 'Deadlines array is required' 
      });
    }

    // Check if should use AI
    const shouldUseAI = useAI && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here';

    let result;
    
    if (shouldUseAI) {
      try {
        console.log('✅ Trying Gemini AI for schedule generation');
        
        // Use Gemini AI for intelligent planning
        const aiResult = await generateStudyPlan({
          timetable: timetableData || [],
          deadlines,
          lifestyle: lifestyle || {},
          studyMode: studyMode || 'normal',
          hardLimits: hardLimits || {},
          scheduleWeeks: scheduleWeeks || 1
        });
        
        // Transform AI response to match frontend format
        if (aiResult.weeks && aiResult.weeks.length > 0) {
          // Multi-week format
          result = {
            weeks: aiResult.weeks.map(week => ({
              weekNumber: week.weekNumber,
              startDate: week.startDate,
              endDate: week.endDate,
              days: Object.keys(week.days).reduce((acc, dayName) => {
                acc[dayName] = week.days[dayName].map((task, idx) => ({
                  id: `week${week.weekNumber}-${dayName}-${idx}`,
                  timeRange: task.time,
                  task: task.activity,
                  category: task.category || 'study',
                  duration: calculateDuration(task.time),
                  priority: task.priority
                }));
                return acc;
              }, {})
            })),
            summary: `${aiResult.workloadAnalysis?.warning}\n\n📊 Chiến lược: ${aiResult.workloadAnalysis?.strategy}`,
            metadata: {
              totalDeadlines: deadlines.length,
              studyMode,
              workloadScore: aiResult.workloadAnalysis?.score,
              deadlineTypes: aiResult.workloadAnalysis?.deadlineTypes,
              totalWeeks: aiResult.weeks.length,
              generatedAt: new Date().toISOString(),
              aiGenerated: true
            }
          };
        } else {
          // Legacy 2-day format (fallback)
          result = {
            today: aiResult.plan?.[0]?.tasks.map((task, idx) => ({
              id: `today-${idx}`,
              timeRange: task.time,
              task: task.activity,
              category: task.category || 'study',
              duration: calculateDuration(task.time)
            })) || [],
            tomorrow: aiResult.plan?.[1]?.tasks.map((task, idx) => ({
              id: `tomorrow-${idx}`,
              timeRange: task.time,
              task: task.activity,
              category: task.category || 'study',
              duration: calculateDuration(task.time)
            })) || [],
            summary: aiResult.workloadAnalysis?.warning || 'Kế hoạch đã được tạo bởi AI',
            metadata: {
              totalDeadlines: deadlines.length,
              studyMode,
              workloadScore: aiResult.workloadAnalysis?.score,
              generatedAt: new Date().toISOString(),
              aiGenerated: true
            }
          };
        }
        
        console.log('✅ Gemini AI generation successful');
      } catch (aiError) {
        console.log('⚠️ Gemini AI failed, falling back to local algorithm');
        console.log('AI Error:', aiError.message);
        
        // Fallback to local algorithm
        result = await generateSchedule({
          deadlines,
          lifestyle: lifestyle || {},
          studyMode: studyMode || 'normal',
          timetableData: timetableData || [],
          hardLimits: hardLimits || {},
          scheduleWeeks: scheduleWeeks || 1
        });
      }
    } else {
      console.log('⚙️ Using local algorithm for schedule generation');
      
      // Fallback to local algorithm
      result = await generateSchedule({
        deadlines,
        lifestyle: lifestyle || {},
        studyMode: studyMode || 'normal',
        timetableData: timetableData || [],
        hardLimits: hardLimits || {},
        scheduleWeeks: scheduleWeeks || 1
      });
    }

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error generating schedule:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate schedule',
      message: error.message 
    });
  }
});

// Helper function to calculate duration
function calculateDuration(timeRange) {
  try {
    const [start, end] = timeRange.split(' - ');
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    const hours = endH - startH + (endM - startM) / 60;
    return hours >= 1 ? `${hours.toFixed(1)} hours` : `${Math.round(hours * 60)} min`;
  } catch {
    return '1 hour';
  }
}

module.exports = router;
