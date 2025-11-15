import express from 'express';
import { generateSchedule } from '../services/scheduleService.js';
import { parseTimetableWithAI, generateStudyPlan } from '../services/geminiService.js';

const router = express.Router();

// POST /api/schedule/parse-text - Parse timetable text with AI
router.post('/parse-text', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return res.status(503).json({ 
        error: 'Gemini API key not configured',
        message: 'Please add GEMINI_API_KEY to .env file'
      });
    }

    const schedule = await parseTimetableWithAI(text);
    res.json({ schedule });
  } catch (error) {
    console.error('Error parsing timetable:', error);
    res.status(500).json({ error: 'Failed to parse timetable' });
  }
});

// POST /api/schedule/generate - Generate optimized study plan
router.post('/generate', async (req, res) => {
  try {
    const { deadlines, lifestyle, studyMode, timetableData, hardLimits, useAI } = req.body;

    // Validate input
    if (!deadlines || !Array.isArray(deadlines)) {
      return res.status(400).json({ error: 'Deadlines array is required' });
    }

    // Check if should use AI
    const shouldUseAI = useAI && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here';

    let result;
    
    if (shouldUseAI) {
      // Use Gemini AI for intelligent planning
      result = await generateStudyPlan({
        timetable: timetableData || [],
        deadlines,
        lifestyle: lifestyle || {},
        studyMode: studyMode || 'normal',
        hardLimits: hardLimits || {}
      });
      
      // Transform AI response to match frontend format
      result = {
        today: result.plan[0]?.tasks.map((task, idx) => ({
          id: `today-${idx}`,
          timeRange: task.time,
          task: task.activity,
          category: task.category || 'study',
          duration: calculateDuration(task.time)
        })) || [],
        tomorrow: result.plan[1]?.tasks.map((task, idx) => ({
          id: `tomorrow-${idx}`,
          timeRange: task.time,
          task: task.activity,
          category: task.category || 'study',
          duration: calculateDuration(task.time)
        })) || [],
        summary: result.workloadAnalysis?.warning || 'Kế hoạch đã được tạo bởi AI',
        metadata: {
          totalDeadlines: deadlines.length,
          studyMode,
          workloadScore: result.workloadAnalysis?.score,
          generatedAt: new Date().toISOString(),
          aiGenerated: true
        }
      };
    } else {
      // Fallback to local algorithm
      result = await generateSchedule({
        deadlines,
        lifestyle: lifestyle || {},
        studyMode: studyMode || 'normal',
        timetableData: timetableData || [],
        hardLimits: hardLimits || {}
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Error generating schedule:', error);
    res.status(500).json({ error: 'Failed to generate schedule' });
  }
});

function calculateDuration(timeRange) {
  const [start, end] = timeRange.split(' - ');
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  const hours = endH - startH + (endM - startM) / 60;
  return hours >= 1 ? `${hours.toFixed(1)} hours` : `${Math.round(hours * 60)} min`;
}

export default router;
