import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Try multiple models until one works
const MODELS_TO_TRY = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-exp',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-1.5-flash-latest',
  'gemini-1.5-pro-latest',
  'gemini-pro',
  'gemini-1.0-pro'
];

let workingModel = null;

async function getWorkingModel() {
  if (workingModel) return workingModel;
  
  console.log('🔍 Testing Gemini models...');
  
  for (const modelName of MODELS_TO_TRY) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Say "OK"');
      const response = await result.response;
      const text = response.text();
      
      if (text) {
        console.log(`✅ Found working model: ${modelName}`);
        workingModel = modelName;
        return modelName;
      }
    } catch (error) {
      console.log(`❌ Model ${modelName} failed: ${error.message}`);
      continue;
    }
  }
  
  console.error('❌ No working Gemini model found. Check your API key.');
  throw new Error('No working Gemini model found. Please check GEMINI_API_KEY in .env file');
}

/**
 * Parse timetable text using Gemini AI
 */
export async function parseTimetableWithAI(rawText) {
  try {
    const modelName = await getWorkingModel();
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `Parse this timetable text into JSON format.

Rules:
- day must be: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday (English only)
- Convert Vietnamese days: "Thứ 2"→Monday, "Thứ 3"→Tuesday, etc.
- Convert "tiết" to time using this table:
  Tiết 1=07:30-08:15, Tiết 2=08:15-09:00, Tiết 3=09:00-09:45
  Tiết 4=10:00-10:45, Tiết 5=10:45-11:30, Tiết 6=11:30-12:15
  Tiết 7=12:45-13:30, Tiết 8=13:30-14:15, Tiết 9=14:15-15:00
  Tiết 10=15:15-16:00, Tiết 11=16:00-16:45, Tiết 12=16:45-17:30

Output JSON:
{
  "valid": true/false,
  "schedule": [
    {"day": "Monday", "startTime": "08:00", "endTime": "10:00", "title": "Math", "location": "Room 101"}
  ]
}

Text: ${rawText}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (!parsed.valid) {
        throw new Error(parsed.reason || 'Invalid timetable format');
      }
      return {
        valid: true,
        schedule: parsed.schedule.map(slot => ({ ...slot, isImported: true }))
      };
    }
    
    throw new Error('Could not parse timetable');
  } catch (error) {
    console.error('Gemini AI parsing error:', error);
    throw error;
  }
}

/**
 * Generate optimized study plan using Gemini AI
 */
export async function generateStudyPlan(input) {
  try {
    const { timetable = [], deadlines, lifestyle = {}, studyMode = 'normal', hardLimits = {}, scheduleWeeks } = input;
    const numWeeks = scheduleWeeks || 1;
    
    // SIMPLE FIX: Use ISO date string to avoid timezone issues
    // Get current date in YYYY-MM-DD format (local timezone)
    const now = new Date();
    const localDateStr = now.toLocaleDateString('en-CA'); // en-CA gives YYYY-MM-DD format
    
    // Parse as UTC to avoid timezone shifts
    const today = new Date(localDateStr + 'T00:00:00Z');
    
    // Start scheduling from tomorrow
    const startDate = new Date(today);
    startDate.setUTCDate(today.getUTCDate() + 1);
    
    const weekDates = [];
    
    console.log(`\n📅 Date calculation:`);
    console.log(`   Server time (now): ${now.toISOString()}`);
    console.log(`   Server time (local): ${now.toString()}`);
    console.log(`   Today (calculated): ${today.toISOString().split('T')[0]}`);
    console.log(`   Start date: ${startDate.toISOString().split('T')[0]} (tomorrow)`);
    console.log(`   Note: If today looks wrong, it's because server timezone != Vietnam timezone`);
    console.log(``);
    
    for (let i = 0; i < numWeeks; i++) {
      const weekStart = new Date(startDate);
      weekStart.setDate(startDate.getDate() + (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekDates.push({
        weekNum: i + 1,
        start: weekStart.toISOString().split('T')[0],
        end: weekEnd.toISOString().split('T')[0]
      });
    }

    // Filter out deadlines that are too close or in the past
    const validDeadlines = deadlines.filter(d => {
      const dueDate = new Date(d.dueDate);
      const daysUntil = Math.ceil((dueDate - startDate) / (1000 * 60 * 60 * 24));
      return daysUntil > 0;
    });

    // Load existing plans from DB (if any)
    let existingPlans = [];
    try {
      const { default: pool } = await import('../db/pool.js');
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + (numWeeks * 7));
      
      const result = await pool.query(`
        SELECT 
          sp.plan_date,
          json_agg(
            json_build_object(
              'taskName', spt.task_name,
              'startTime', TO_CHAR(spt.start_time, 'HH24:MI'),
              'endTime', TO_CHAR(spt.end_time, 'HH24:MI')
            )
          ) as tasks
        FROM study_plans sp
        LEFT JOIN study_plan_tasks spt ON sp.plan_id = spt.plan_id
        WHERE sp.plan_date BETWEEN $1 AND $2
        GROUP BY sp.plan_date
        ORDER BY sp.plan_date
      `, [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]);
      
      existingPlans = result.rows || [];
      console.log(`\n📚 Found ${existingPlans.length} existing plan(s) in DB`);
    } catch (error) {
      console.log('⚠️ Could not load existing plans:', error.message);
    }

    console.log('\n📊 ===== AI INPUT =====');
    console.log('Valid Deadlines:', validDeadlines.length);
    validDeadlines.forEach((d, i) => {
      const dueDate = new Date(d.dueDate);
      const daysUntil = Math.ceil((dueDate - startDate) / (1000 * 60 * 60 * 24));
      console.log(`  ${i+1}. "${d.title}" - ${d.estimatedHours}h - Due: ${d.dueDate} (${daysUntil} days)`);
      console.log(`      Valid range: ${startDate.toISOString().split('T')[0]} to ${new Date(dueDate.getTime() - 24*60*60*1000).toISOString().split('T')[0]}`);
    });
    console.log('======================\n');

    if (validDeadlines.length === 0) {
      return {
        workloadAnalysis: { score: 0, warning: 'No valid deadlines', strategy: 'Add new deadlines' },
        weeks: []
      };
    }

    const modelName = await getWorkingModel();
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: { maxOutputTokens: 4000, temperature: 0.7 }
    });

    // Create ultra-clear prompt focused on dates
    const existingScheduleInfo = existingPlans.length > 0 
      ? `\n📚 EXISTING SCHEDULE (already in database):\n${existingPlans.map(p => 
          `${p.plan_date}: ${p.tasks.filter(t => t.taskName).map(t => `${t.startTime}-${t.endTime} ${t.taskName}`).join(', ')}`
        ).join('\n')}\n\n⚠️ Avoid scheduling at the same times as existing tasks!\n`
      : '';

    // Ensure lifestyle has default values
    const lifestyleDefaults = {
      sleepHours: 7,
      lunchDuration: 45,
      dinnerDuration: 45,
      ...lifestyle
    };

    // Detect weak subjects and calculate actual hours
    const processedDeadlines = validDeadlines.map(d => {
      const isWeak = d.details && /yếu|weak|chưa có nền/i.test(d.details);
      const estimatedHours = parseFloat(d.estimatedHours) || 0;
      const actualHours = isWeak ? estimatedHours * 1.3 : estimatedHours;
      return { ...d, isWeak, actualHours, estimatedHours };
    });

    // Calculate workload for mode suggestion
    const totalHours = processedDeadlines.reduce((sum, d) => sum + (d.actualHours || 0), 0);
    const timetableHours = (timetable?.length || 0) * 2;
    const availableHours = (24 - lifestyleDefaults.sleepHours - (lifestyleDefaults.lunchDuration + lifestyleDefaults.dinnerDuration) / 60 - timetableHours) * numWeeks * 7;
    const workloadRatio = totalHours / availableHours;

    const prompt = `Bạn là AI trợ lý lập lịch học thông minh. Nhiệm vụ: Tạo lịch học tối ưu cho sinh viên.

� 🚨🚨 CRITICAL RULE - ĐỌC KỸ TRƯỚC KHI TẠO LỊCH 🚨🚨🚨

MỖI DEADLINE CÓ "NGÀY HỢP LỆ" - CHỈ ĐƯỢC SCHEDULE VÀO NHỮNG NGÀY ĐÓ!
- Nếu deadline là 2025-11-20, NGÀY HỢP LỆ là: 2025-11-17, 2025-11-18, 2025-11-19
- TUYỆT ĐỐI KHÔNG schedule vào 2025-11-20 (ngày deadline)
- TUYỆT ĐỐI KHÔNG schedule vào 2025-11-21 trở đi (sau deadline)

VÍ DỤ CỤ THỂ:
❌ SAI: "Thi toeic" (deadline 2025-11-20) → schedule vào 2025-11-22 → BỊ XÓA
✅ ĐÚNG: "Thi toeic" (deadline 2025-11-20) → schedule vào 2025-11-17, 2025-11-18, 2025-11-19

📅 THÔNG TIN NGÀY THÁNG
- Ngày hiện tại: ${today.toISOString().split('T')[0]} ❌ QUÁ KHỨ
- Ngày bắt đầu: ${startDate.toISOString().split('T')[0]} ✅ BẮT ĐẦU
- Số tuần: ${numWeeks}

🚨 QUY TẮC NGÀY (VI PHẠM = XÓA TASK):
1. CHỈ schedule từ ${startDate.toISOString().split('T')[0]} trở đi
2. KHÔNG schedule vào/sau ngày deadline
3. XEM KỸ "NGÀY HỢP LỆ" của mỗi deadline bên dưới

🎯 QUY TẮC CHIA NHỎ DEADLINE (CHUNKING):
1. ✅ Tổng thời gian các tasks = estimatedHours (CHÍNH XÁC)
2. ✅ Chia thành nhiều sessions nhỏ (1-2h mỗi session)
3. ✅ Phân bổ đều qua nhiều ngày (KHÔNG dồn vào 1 ngày)
4. ✅ Mỗi task phải có: time, activity, category, priority
5. ✅ KHÔNG bỏ sót task nào

${existingScheduleInfo}
📚 DEADLINES CẦN XỬ LÝ:
${processedDeadlines.map((d, i) => {
  const dueDate = new Date(d.dueDate);
  
  // Calculate valid dates
  const validDates = [];
  let currentDate = new Date(startDate);
  while (currentDate < dueDate) {
    validDates.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  const daysUntil = Math.ceil((dueDate - startDate) / (1000 * 60 * 60 * 24));
  
  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${i+1}. 📚 "${d.title}"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   � Dheadline: ${dueDate.toISOString().split('T')[0]} (còn ${daysUntil} ngày)
   ⏱️ Giờ cần: ${d.actualHours.toFixed(1)}h ${d.isWeak ? '🚨 YẾU MÔN (đã tăng 30%)' : ''}
   📝 Chi tiết: ${d.details || 'Không có'}
   
   🚨🚨🚨 NGÀY HỢP LỆ - CHỈ ĐƯỢC SCHEDULE VÀO NHỮNG NGÀY NÀY 🚨🚨🚨
   ${validDates.map(date => `✅ ${date}`).join('\n   ')}
   
   ❌❌❌ NGÀY CẤM - TUYỆT ĐỐI KHÔNG SCHEDULE ❌❌❌ 
   - Trước ${startDate.toISOString().split('T')[0]}: ❌ QUÁ KHỨ
   - ${dueDate.toISOString().split('T')[0]} trở đi: ❌ DEADLINE hoặc SAU DEADLINE
   
   🎯 YÊU CẦU: Tạo đủ ${d.actualHours.toFixed(1)}h tasks, phân bổ đều trong ${validDates.length} ngày hợp lệ
   � QVÍ DỤ: Nếu cần 3h, chia thành: ${validDates[0]} (1.5h) + ${validDates[Math.floor(validDates.length/2)]} (1.5h)
   ${d.isWeak ? '⚠️ ĐÂY LÀ MÔN YẾU - Ưu tiên schedule sớm và nhiều session!' : ''}`;
}).join('\n')}

🗓️ THỜI KHÓA BIỂU CỨ (⛔ TUYỆT ĐỐI KHÔNG schedule vào các slot này):
${timetable && timetable.length > 0 ? timetable.map(slot => 
  `⛔ ${slot.day} ${slot.startTime}-${slot.endTime}: ${slot.title} ${slot.location ? `(${slot.location})` : ''}`
).join('\n') : '✅ Không có lịch học cứng - Toàn bộ thời gian đều khả dụng'}

⏰ THỜI GIAN CẦN TRÁNH (để ăn/ngủ/nghỉ ngơi):
${studyMode === 'sprint' ? `
🔥 SPRINT MODE - Tối ưu hóa thời gian:
- 🌙 Ngủ: 23:00-06:00 (6-7h) - CÓ THỂ rút ngắn nếu cần
- 🍽️ Bữa trưa: 12:00-12:30 (30min)
- 🍽️ Bữa tối: 18:00-18:30 (30min)
- ✅ Có thể học: 06:00-23:00 (trừ bữa ăn và TKB cứng)
` : studyMode === 'relaxed' ? `
😌 RELAXED MODE - Cân bằng sức khỏe:
- 🌙 Ngủ: 22:00-06:00 (${lifestyleDefaults.sleepHours}h) - KHÔNG rút ngắn
- 🍽️ Bữa trưa: 12:00-13:00 (${lifestyleDefaults.lunchDuration}min)
- 🍽️ Bữa tối: 18:00-19:00 (${lifestyleDefaults.dinnerDuration}min)
- ✅ Có thể học: 06:00-22:00 (trừ bữa ăn và TKB cứng)
` : `
📚 NORMAL MODE - Cân bằng:
- 🌙 Ngủ: 22:30-06:00 (7-7.5h) - Có thể điều chỉnh nhẹ
- 🍽️ Bữa trưa: 12:00-12:45 (${lifestyleDefaults.lunchDuration}min)
- 🍽️ Bữa tối: 18:00-18:45 (${lifestyleDefaults.dinnerDuration}min)
- ✅ Có thể học: 06:00-22:30 (trừ bữa ăn và TKB cứng)
`}

⚙️ CHẾ ĐỘ HỌC:
- Chế độ: ${studyMode === 'sprint' ? '🔥 SPRINT (Nước rút)' : studyMode === 'relaxed' ? '😌 RELAXED (Thư giãn)' : '📚 NORMAL (Bình thường)'}

� CƯHIẾN LƯỢC PHÂN BỔ THỜI GIAN:

1️⃣ TRÁNH XUNG ĐỘT (QUAN TRỌNG):
   - ⛔ KHÔNG schedule vào thời gian TKB cứng
   - ⛔ KHÔNG schedule vào giờ ăn (12:00-13:00, 18:00-19:00)
   - ⛔ KHÔNG schedule vào giờ ngủ (22:00-06:00)
   - 🚨 KHÔNG tạo 2 tasks cùng khung giờ (VD: 08:00-10:00 và 09:00-11:00 = TRÙNG)
   - ✅ Mỗi task phải có thời gian RIÊNG BIỆT, KHÔNG chồng lấn
   - ✅ Để khoảng trống giữa các tasks (VD: 08:00-10:00, sau đó 10:00-12:00)

2️⃣ PHÂN BỔ ĐỀU:
   - ❌ KHÔNG dồn tất cả vào 1 ngày (VD: 8h trong 1 ngày)
   - ✅ Chia đều qua nhiều ngày (VD: 2h/ngày x 4 ngày)
   - ✅ Mỗi ngày: ${studyMode === 'sprint' ? '4-6h' : studyMode === 'relaxed' ? '2-4h' : '3-5h'} học tối đa
   - ✅ Mỗi session: 1-2h (có nghỉ giữa các session)

3️⃣ THỜI GIAN TỐI ƯU:
   - 🌅 Sáng (07:00-11:00): Tốt cho môn khó, môn yếu
   - 🌞 Chiều (14:00-17:00): Tốt cho ôn tập, làm bài tập
   - 🌆 Tối (19:00-22:00): Tốt cho review, đọc tài liệu

4️⃣ ƯU TIÊN:
   ${studyMode === 'sprint' ? `
   🔥 SPRINT: Deadline gần → Môn yếu → Deadline xa
   - Tăng cường độ nhưng KHÔNG quá 6h/ngày
   ` : studyMode === 'relaxed' ? `
   😌 RELAXED: Phân bổ đều → Cân bằng → Không áp lực
   - Tối đa 4h/ngày, nghỉ đầy đủ
   ` : `
   📚 NORMAL: Deadline gần → Cân bằng → Deadline xa
   - Tối đa 5h/ngày, cân bằng nghỉ ngơi
   `}

🚫 GIỚI HẠN CỨNG (TUYỆT ĐỐI KHÔNG VI PHẠM):
${hardLimits.noAfter23 ? '- ⛔ KHÔNG học sau 23:00' : '- ✅ Có thể học sau 23:00'}
${hardLimits.noSundays ? '- ⛔ KHÔNG học Chủ nhật' : '- ✅ Có thể học Chủ nhật'}

📊 PHÂN TÍCH WORKLOAD:
- Tổng giờ cần: ${totalHours.toFixed(1)}h
- Giờ khả dụng: ${availableHours.toFixed(1)}h
- Tỷ lệ: ${(workloadRatio * 100).toFixed(0)}%
- Đánh giá: ${workloadRatio < 0.3 ? '✅ Nhẹ' : workloadRatio < 0.6 ? '⚠️ Vừa' : workloadRatio < 0.8 ? '🔥 Nặng' : '🚨 Quá tải'}

📅 TUẦN CẦN TẠO LỊCH:
${weekDates.map(w => {
  const ws = new Date(w.start);
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  return `Week ${w.weekNum}: ${w.start} → ${w.end}\n${days.map((d,i) => {
    const date = new Date(ws);
    date.setDate(ws.getDate() + i);
    return `  ${d.padEnd(10)} = ${date.toISOString().split('T')[0]}`;
  }).join('\n')}`;
}).join('\n\n')}

🎯 YÊU CẦU OUTPUT (TUYỆT ĐỐI TUÂN THỦ):
1. ✅ Tổng giờ học = actualHours (chính xác, sai số < 0.5h)
2. ✅ Mỗi session: 1-2 giờ (không quá dài)
3. ✅ Ưu tiên deadline gần và môn yếu
4. ✅ Tránh xung đột với thời khóa biểu cứng
5. ✅ Tuân thủ hard limits
6. ✅ Điều chỉnh sleep/meal theo study mode
7. ✅ Đưa ra workload analysis và strategy rõ ràng
8. 🚨 CHỈ schedule vào NGÀY HỢP LỆ đã liệt kê ở trên - KHÔNG schedule vào ngày deadline hoặc sau đó

📤 OUTPUT JSON (BẮT BUỘC):
{
  "workloadAnalysis": {
    "score": 1-10,
    "warning": "Mô tả tình trạng workload (VD: Bạn có 2 deadline khẩn cấp, trong đó 1 môn yếu)",
    "strategy": "Giải thích chiến lược AI đã áp dụng (VD: Tăng 30% thời gian cho Toán vì yếu môn, giảm giờ ngủ xuống 6h do sprint mode)"
  },
  "weeks": [
    {
      "weekNumber": 1,
      "startDate": "${weekDates[0].start}",
      "endDate": "${weekDates[0].end}",
      "days": {
        "Sunday": [],
        "Monday": [
          {
            "time": "08:00 - 09:30",
            "activity": "Study: Bài tập Toán (yếu môn)",
            "category": "study",
            "priority": "high"
          }
        ],
        "Tuesday": [],
        "Wednesday": [],
        "Thursday": [],
        "Friday": [],
        "Saturday": []
      }
    }
  ]
}

⚠️ LƯU Ý QUAN TRỌNG:
- Nếu không chắc chắn về ngày, ưu tiên schedule ít hơn
- Nếu phát hiện xung đột, bỏ qua task đó
- Nếu workload quá cao, đưa ra warning rõ ràng
- Luôn giải thích strategy trong workloadAnalysis

🎯 VÍ DỤ CHUNKING DEADLINE:

Giả sử có deadline "Bài tập Toán" 6h, due ${processedDeadlines[0] ? new Date(processedDeadlines[0].dueDate).toISOString().split('T')[0] : '2025-11-20'}:

❌ SAI - Dồn vào 1 ngày:
{
  "Monday": [
    {"time": "08:00 - 14:00", "activity": "Study: Bài tập Toán", "category": "study", "priority": "high"}
  ]
}
→ 6h liên tục - QUÁ DÀI! Sinh viên sẽ mệt

❌ SAI - Thiếu giờ (AI tạo không đủ tasks):
{
  "Monday": [
    {"time": "08:00 - 10:00", "activity": "Study: Bài tập Toán - Phần 1", "category": "study", "priority": "high"}
  ],
  "Tuesday": [
    {"time": "08:00 - 10:00", "activity": "Continue: Bài tập Toán - Phần 2", "category": "study", "priority": "high"}
  ]
}
→ Chỉ 4h, thiếu 2h! PHẢI đủ 6h

❌ SAI - Schedule vào hoặc sau deadline:
Deadline: 2025-11-20
{
  "Monday": [{"time": "08:00 - 10:00", "activity": "Study: Bài tập Toán - Phần 1"}],
  "Tuesday": [{"time": "08:00 - 10:00", "activity": "Study: Bài tập Toán - Phần 2"}],
  "2025-11-20": [{"time": "08:00 - 10:00", "activity": "Study: Bài tập Toán - Phần 3"}]  ← ❌ NGÀY DEADLINE
}
→ Task cuối rơi vào NGÀY DEADLINE → BỊ XÓA!

❌ SAI - Schedule sau deadline:
Deadline: 2025-11-20
{
  "Monday": [{"time": "08:00 - 10:00", "activity": "Study: Bài tập Toán - Phần 1"}],
  "2025-11-21": [{"time": "08:00 - 10:00", "activity": "Study: Bài tập Toán - Phần 2"}]  ← ❌ SAU DEADLINE
}
→ Task thứ 2 SAU deadline → BỊ XÓA!

❌ SAI - Tasks trùng khung giờ (TIME CONFLICT):
{
  "Monday": [
    {"time": "08:00 - 10:00", "activity": "Study: Toán"},
    {"time": "09:00 - 11:00", "activity": "Study: Lý"}  ← ❌ TRÙNG với task trên (09:00-10:00)
  ]
}
→ 2 tasks cùng lúc → KHÔNG THỂ HỌC 2 MÔN CÙNG LÚC!

❌ SAI - Xung đột với TKB cứng:
TKB: Monday 08:00-10:00 có lớp
{
  "Monday": [
    {"time": "08:00 - 10:00", "activity": "Study: ..."} ← ❌ TRÙNG với lớp học
  ]
}

✅ ĐÚNG - Phân bổ đều, đủ giờ, KHÔNG trùng:
{
  "Monday": [
    {"time": "08:00 - 10:00", "activity": "Study: Bài tập Toán - Phần 1 (Lý thuyết)", "category": "study", "priority": "high"},
    {"time": "14:00 - 16:00", "activity": "Study: Bài tập Toán - Phần 2 (Bài tập)", "category": "study", "priority": "high"}
  ],
  "Tuesday": [
    {"time": "08:00 - 10:00", "activity": "Study: Bài tập Toán - Phần 3 (Ôn tập)", "category": "study", "priority": "high"}
  ]
}
→ Tổng: 2h + 2h + 2h = 6h ✅
→ Không trùng khung giờ ✅
→ Có khoảng nghỉ giữa các session ✅
  ]
}

✅ ĐÚNG - Tránh TKB:
{
  "Monday": [
    {"time": "14:00 - 16:00", "activity": "Study: ..."} // Sau giờ học → OK!
  ]
}

❌ SAI - Schedule vào quá khứ:
{
  "days": {
    "${today.toISOString().split('T')[0]}": [...] // HÔM NAY - KHÔNG được!
  }
}

✅ ĐÚNG - Schedule từ ngày mai:
{
  "days": {
    "${startDate.toISOString().split('T')[0]}": [...] // NGÀY MAI - OK!
  }
}

🔥 QUAN TRỌNG NHẤT - TUYỆT ĐỐI PHẢI TUÂN THỦ:

1. ✅ Tổng giờ các tasks = estimatedHours (CHÍNH XÁC 100%)
   - VD: Deadline 2h → Phải tạo đủ 2h tasks (1h + 1h HOẶC 0.5h + 0.5h + 1h)
   
2. ✅ TẤT CẢ tasks phải nằm trong "NGÀY HỢP LỆ"
   - KHÔNG được schedule vào ngày deadline
   - KHÔNG được schedule sau ngày deadline
   - Nếu deadline ${processedDeadlines[0] ? new Date(processedDeadlines[0].dueDate).toISOString().split('T')[0] : '2025-11-20'} → Task cuối phải <= ${processedDeadlines[0] ? new Date(new Date(processedDeadlines[0].dueDate).getTime() - 24*60*60*1000).toISOString().split('T')[0] : '2025-11-19'}
   
3. ✅ Mỗi task có đầy đủ: time, activity, category, priority

4. ❌ KHÔNG bỏ sót task nào

5. ❌ KHÔNG schedule vào quá khứ (< ${startDate.toISOString().split('T')[0]})

6. ❌ KHÔNG dồn quá 4-6h vào 1 ngày

⚠️ NẾU KHÔNG ĐỦ NGÀY: Tăng số giờ mỗi session (VD: 2h → 3h) để đủ tổng giờ`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('\n🤖 AI Response:', text.substring(0, 300) + '...\n');
    
    // Extract JSON
    let parsed = null;
    const codeBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      try {
        parsed = JSON.parse(codeBlockMatch[1]);
      } catch (e) {
        console.log('⚠️ Failed to parse JSON from code block');
      }
    }
    
    if (!parsed) {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          let jsonStr = jsonMatch[0];
          jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');
          const openBraces = (jsonStr.match(/\{/g) || []).length;
          const closeBraces = (jsonStr.match(/\}/g) || []).length;
          for (let i = 0; i < openBraces - closeBraces; i++) jsonStr += '}';
          parsed = JSON.parse(jsonStr);
        } catch (e) {
          console.log('⚠️ Failed to parse JSON:', e.message);
        }
      }
    }
    
    if (!parsed) {
      throw new Error('Could not extract valid JSON from AI response');
    }
    
    // Auto-fix: Move tasks that are after deadline to valid dates
    console.log('\n🔧 Auto-fixing invalid dates...');
    let autoFixCount = 0;
    
    parsed.weeks?.forEach((week) => {
      const weekStart = new Date(week.startDate);
      const days = week.days || {};
      
      Object.entries(days).forEach(([dayName, tasks]) => {
        if (tasks && tasks.length > 0) {
          const dayIndex = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].indexOf(dayName);
          const taskDate = new Date(weekStart);
          taskDate.setDate(weekStart.getDate() + dayIndex);
          const taskDateOnly = new Date(taskDate);
          taskDateOnly.setHours(0, 0, 0, 0);
          
          tasks.forEach(task => {
            if (task.category !== 'study') return;
            
            // Find which deadline this task belongs to
            for (const d of validDeadlines) {
              const titleWords = d.title.toLowerCase().split(' ');
              const activityLower = task.activity.toLowerCase();
              
              if (titleWords.some(word => word.length > 3 && activityLower.includes(word))) {
                const dueDate = new Date(d.dueDate);
                const dueDateOnly = new Date(dueDate);
                dueDateOnly.setHours(0, 0, 0, 0);
                
                // If task is after deadline, try to move it to last valid date
                if (taskDateOnly > dueDateOnly) {
                  const lastValidDate = new Date(dueDate);
                  lastValidDate.setDate(lastValidDate.getDate() - 1);
                  
                  console.log(`   🔧 Moving task from ${taskDate.toISOString().split('T')[0]} to ${lastValidDate.toISOString().split('T')[0]}: ${task.activity}`);
                  
                  // Find the target day in the week
                  const targetDayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][lastValidDate.getDay()];
                  
                  // Move task to target day
                  if (!week.days[targetDayName]) {
                    week.days[targetDayName] = [];
                  }
                  week.days[targetDayName].push(task);
                  
                  // Mark for removal from current day
                  task._shouldRemove = true;
                  autoFixCount++;
                }
                break;
              }
            }
          });
          
          // Remove marked tasks
          week.days[dayName] = tasks.filter(t => !t._shouldRemove);
        }
      });
    });
    
    if (autoFixCount > 0) {
      console.log(`   ✅ Auto-fixed ${autoFixCount} task(s)`);
    } else {
      console.log(`   ✅ No auto-fix needed`);
    }
    
    // Detect and resolve time conflicts
    console.log('\n🔍 Checking for time conflicts...');
    let conflictCount = 0;
    
    parsed.weeks?.forEach((week) => {
      const weekStart = new Date(week.startDate);
      const days = week.days || {};
      
      Object.entries(days).forEach(([dayName, tasks]) => {
        if (!tasks || tasks.length <= 1) return;
        
        const dayIndex = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].indexOf(dayName);
        const taskDate = new Date(weekStart);
        taskDate.setDate(weekStart.getDate() + dayIndex);
        const dateStr = taskDate.toISOString().split('T')[0];
        
        // Sort tasks by start time
        const sortedTasks = [...tasks].sort((a, b) => {
          const aStart = a.time?.split(' - ')[0] || '00:00';
          const bStart = b.time?.split(' - ')[0] || '00:00';
          return aStart.localeCompare(bStart);
        });
        
        // Check for overlaps
        const validTasks = [];
        const conflictedTasks = [];
        
        sortedTasks.forEach((task, index) => {
          if (!task.time || !task.time.includes(' - ')) {
            validTasks.push(task);
            return;
          }
          
          const [startStr, endStr] = task.time.split(' - ');
          const [startH, startM] = startStr.split(':').map(Number);
          const [endH, endM] = endStr.split(':').map(Number);
          const taskStart = startH * 60 + (startM || 0);
          const taskEnd = endH * 60 + (endM || 0);
          
          // Check against already validated tasks
          let hasConflict = false;
          for (const validTask of validTasks) {
            if (!validTask.time || !validTask.time.includes(' - ')) continue;
            
            const [vStartStr, vEndStr] = validTask.time.split(' - ');
            const [vStartH, vStartM] = vStartStr.split(':').map(Number);
            const [vEndH, vEndM] = vEndStr.split(':').map(Number);
            const vStart = vStartH * 60 + (vStartM || 0);
            const vEnd = vEndH * 60 + (vEndM || 0);
            
            // Check overlap: (start1 < end2) AND (start2 < end1)
            if (taskStart < vEnd && vStart < taskEnd) {
              hasConflict = true;
              console.log(`   ⚠️ CONFLICT on ${dateStr}: ${task.time} "${task.activity}" overlaps with ${validTask.time} "${validTask.activity}"`);
              conflictedTasks.push(task);
              conflictCount++;
              break;
            }
          }
          
          if (!hasConflict) {
            validTasks.push(task);
          }
        });
        
        // Try to reschedule conflicted tasks to next available slot
        conflictedTasks.forEach(task => {
          const [startStr, endStr] = task.time.split(' - ');
          const [startH, startM] = startStr.split(':').map(Number);
          const [endH, endM] = endStr.split(':').map(Number);
          const duration = (endH * 60 + (endM || 0)) - (startH * 60 + (startM || 0));
          
          // Find next available slot (after last task)
          if (validTasks.length > 0) {
            const lastTask = validTasks[validTasks.length - 1];
            if (lastTask.time && lastTask.time.includes(' - ')) {
              const lastEndStr = lastTask.time.split(' - ')[1];
              const [lastEndH, lastEndM] = lastEndStr.split(':').map(Number);
              const newStartMinutes = lastEndH * 60 + (lastEndM || 0);
              const newEndMinutes = newStartMinutes + duration;
              
              // Check if new time is reasonable (before 23:00)
              if (newEndMinutes <= 23 * 60) {
                const newStartH = Math.floor(newStartMinutes / 60);
                const newStartM = newStartMinutes % 60;
                const newEndH = Math.floor(newEndMinutes / 60);
                const newEndM = newEndMinutes % 60;
                
                task.time = `${String(newStartH).padStart(2, '0')}:${String(newStartM).padStart(2, '0')} - ${String(newEndH).padStart(2, '0')}:${String(newEndM).padStart(2, '0')}`;
                validTasks.push(task);
                console.log(`   ✅ RESCHEDULED: "${task.activity}" to ${task.time}`);
                conflictCount--; // Successfully resolved
              } else {
                console.log(`   ❌ REMOVED: "${task.activity}" - cannot reschedule (too late)`);
              }
            }
          }
        });
        
        // Update tasks for this day
        week.days[dayName] = validTasks;
      });
    });
    
    if (conflictCount > 0) {
      console.log(`   ⚠️ ${conflictCount} unresolved conflict(s) - tasks removed`);
    } else {
      console.log(`   ✅ No time conflicts`);
    }
    
    // Post-process: STRICT validation
    console.log('\n🔍 STRICT Validation...');
    console.log(`   Start date boundary: ${startDate.toISOString().split('T')[0]}`);
    let removedCount = 0;
    const deadlineHours = {};
    
    // Initialize hour tracking
    validDeadlines.forEach(d => {
      deadlineHours[d.title] = { 
        estimated: parseFloat(d.estimatedHours), 
        actual: 0,
        dueDate: new Date(d.dueDate)
      };
    });
    
    parsed.weeks?.forEach((week) => {
      const weekStart = new Date(week.startDate);
      const days = week.days || {};
      
      Object.entries(days).forEach(([dayName, tasks]) => {
        if (tasks && tasks.length > 0) {
          const dayIndex = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].indexOf(dayName);
          const taskDate = new Date(weekStart);
          taskDate.setDate(weekStart.getDate() + dayIndex);
          const taskDateStr = taskDate.toISOString().split('T')[0];
          
          const filteredTasks = tasks.filter(task => {
            if (task.category !== 'study') return true;
            
            // STRICT: Check if task is in the past or before startDate
            const taskDateOnly = new Date(taskDate);
            taskDateOnly.setHours(0, 0, 0, 0);
            const todayOnly = new Date(today);
            todayOnly.setHours(0, 0, 0, 0);
            const startDateOnly = new Date(startDate);
            startDateOnly.setHours(0, 0, 0, 0);
            
            // Check 1: Task must not be in the past (before today)
            if (taskDateOnly < todayOnly) {
              console.log(`   ❌ IN PAST: ${taskDateStr} < ${today.toISOString().split('T')[0]} | ${task.activity}`);
              removedCount++;
              return false;
            }
            
            // Check 2: Task must be >= startDate
            if (taskDateOnly < startDateOnly) {
              console.log(`   ❌ BEFORE START: ${taskDateStr} < ${startDate.toISOString().split('T')[0]} | ${task.activity}`);
              removedCount++;
              return false;
            }
            
            // Check against each deadline
            let isValid = true;
            for (const d of validDeadlines) {
              const titleWords = d.title.toLowerCase().split(' ');
              const activityLower = task.activity.toLowerCase();
              
              // Check if this task is for this deadline
              if (titleWords.some(word => word.length > 3 && activityLower.includes(word))) {
                const dueDate = new Date(d.dueDate);
                const dueDateOnly = new Date(dueDate);
                dueDateOnly.setHours(0, 0, 0, 0);
                
                // STRICT: Task must be ON or BEFORE deadline (not after)
                if (taskDateOnly > dueDateOnly) {
                  console.log(`   ❌ AFTER DEADLINE: ${taskDateStr} > ${dueDate.toISOString().split('T')[0]} | ${task.activity}`);
                  removedCount++;
                  isValid = false;
                  break;
                }
                
                // Track hours
                const [start, end] = (task.time || '').split(' - ');
                if (start && end) {
                  const [sh, sm] = start.split(':').map(Number);
                  const [eh, em] = end.split(':').map(Number);
                  const hours = (eh * 60 + em - sh * 60 - sm) / 60;
                  deadlineHours[d.title].actual += hours;
                }
                
                console.log(`   ✅ VALID: ${taskDateStr} | ${task.activity}`);
              }
            }
            return isValid;
          });
          
          week.days[dayName] = filteredTasks;
        }
      });
    });
    
    // Report hours and handle mismatches
    console.log('\n📊 Hours validation:');
    Object.entries(deadlineHours).forEach(([title, data]) => {
      const diff = Math.abs(data.actual - data.estimated);
      const status = diff < 0.5 ? '✅' : '⚠️';
      console.log(`   ${status} "${title}": ${data.actual.toFixed(1)}h / ${data.estimated}h`);
      
      // If significantly different, log warning but DON'T remove tasks
      if (diff > 0.5) {
        if (data.actual > data.estimated) {
          console.log(`   ⚠️ Exceeded by ${(data.actual - data.estimated).toFixed(1)}h`);
          console.log(`   💡 Keeping all tasks - student may need extra time`);
        } else {
          console.log(`   ⚠️ Short by ${(data.estimated - data.actual).toFixed(1)}h`);
          console.log(`   💡 AI should have created more tasks - but keeping what we have`);
        }
      }
    });
    
    // Final summary - count all study tasks
    let totalTasks = 0;
    let keptTasks = 0;
    parsed.weeks?.forEach(week => {
      Object.values(week.days || {}).forEach(tasks => {
        if (Array.isArray(tasks)) {
          const studyTasks = tasks.filter(t => t.category === 'study');
          keptTasks += studyTasks.length;
        }
      });
    });
    totalTasks = keptTasks + removedCount;
    
    console.log('\n📋 FINAL SUMMARY:');
    console.log(`   Total tasks created: ${totalTasks} tasks`);
    console.log(`   Tasks removed: ${removedCount}`);
    console.log(`   Tasks kept: ${keptTasks}`);
    
    if (removedCount > 0) {
      console.log(`\n⚠️ Removed ${removedCount} invalid tasks (past dates or conflicts)\n`);
    } else {
      console.log('\n✅ All tasks are valid\n');
    }
    
    return parsed;
  } catch (error) {
    console.error('Gemini AI generation error:', error);
    return {
      workloadAnalysis: {
        score: 5,
        warning: 'AI generation failed. Using fallback.',
        strategy: 'Please try again'
      },
      weeks: []
    };
  }
}
