# 🤖 Hướng dẫn Prompt cho Gemini AI - Smart Scheduler

## Tổng quan hệ thống

Smart Scheduler là hệ thống tạo lịch học thông minh cho sinh viên, sử dụng Gemini AI để:
1. **Parse thời khóa biểu** từ text lộn xộn thành JSON có cấu trúc
2. **Generate lịch học tối ưu** dựa trên deadlines, preferences, và constraints

---

## 📊 DỮ LIỆU ĐẦU VÀO (Input Data)

### 1. Deadlines (Danh sách công việc cần hoàn thành)

```typescript
interface Deadline {
  id: string;
  title: string;              // VD: "Bài tập Toán", "Báo cáo Web"
  dueDate: string;            // ISO date: "2025-11-20"
  estimatedHours: number;     // VD: 4.5 (giờ)
  details: string;            // VD: "Em yếu môn này", "Chưa có nền tảng"
  type: 'flexible' | 'fixed'; // flexible = tự học, fixed = kiểm tra/thi
  fixedTime?: string;         // Nếu type='fixed': "Monday|08:00-10:00"
}
```

**Ý nghĩa:**
- `estimatedHours`: Số giờ sinh viên ước tính cần để hoàn thành
- `details`: **QUAN TRỌNG** - Nếu có từ "yếu", "weak", "chưa có nền" → AI phải tăng thời gian lên 30%
- `type='fixed'`: Deadline này rơi vào slot cố định trong TKB (VD: kiểm tra giữa kỳ)

### 2. Timetable (Thời khóa biểu cứng)

```typescript
interface TimetableSlot {
  day: 'Monday' | 'Tuesday' | ... | 'Sunday';
  startTime: string;  // "08:00"
  endTime: string;    // "10:00"
  title: string;      // "Calculus II"
  location?: string;  // "Room A101"
  isImported: boolean; // true nếu được import từ AI
}
```

**Ý nghĩa:**
- Đây là các slot **KHÔNG THỂ THAY ĐỔI** (lịch học trên trường)
- AI **TUYỆT ĐỐI KHÔNG** được schedule task vào các slot này

### 3. Lifestyle Preferences (Thói quen sinh hoạt)

```typescript
interface LifestylePrefs {
  sleepHours: number;        // VD: 7 (giờ ngủ mỗi ngày)
  lunchDuration: number;     // VD: 45 (phút)
  dinnerDuration: number;    // VD: 45 (phút)
}
```

**Ý nghĩa:**
- Đây là **GIÁ TRỊ ĐỀ XUẤT** từ sinh viên
- AI có thể **"THƯƠNG LƯỢNG"** (điều chỉnh) dựa trên `studyMode`

### 4. Study Mode (Chế độ học)

```typescript
type StudyMode = 'relaxed' | 'normal' | 'sprint';
```

**Ý nghĩa:**
- `relaxed` (😌): Giữ nguyên lifestyle, không áp lực
- `normal` (📚): Điều chỉnh nhẹ nếu cần (giảm 1h ngủ, rút ngắn bữa ăn)
- `sprint` (🔥): Tối ưu hóa tối đa (giảm xuống 6h ngủ, bữa ăn 30 phút)

### 5. Hard Limits (Giới hạn cứng)

```typescript
interface HardLimits {
  noAfter23: boolean;   // true = KHÔNG học sau 23:00
  noSundays: boolean;   // true = KHÔNG học Chủ nhật
}
```

**Ý nghĩa:**
- Đây là **QUY TẮC TUYỆT ĐỐI**, AI không được vi phạm

### 6. Schedule Weeks (Số tuần cần tạo lịch)

```typescript
scheduleWeeks: number;  // VD: 2 (tạo lịch cho 2 tuần)
```

---

## 🎯 NHIỆM VỤ CỦA AI

### Nhiệm vụ 1: Parse Timetable Text

**Input:** Đoạn text lộn xộn
```
Monday 8:00-10:00 Calculus II - Room A101
Thứ 3 tiết 4-6 An toàn thông tin - P.502
```

**Output:** JSON có cấu trúc
```json
{
  "valid": true,
  "schedule": [
    {
      "day": "Monday",
      "startTime": "08:00",
      "endTime": "10:00",
      "title": "Calculus II",
      "location": "Room A101"
    },
    {
      "day": "Tuesday",
      "startTime": "10:00",
      "endTime": "12:15",
      "title": "An toàn thông tin",
      "location": "P.502"
    }
  ]
}
```

**Quy tắc:**
1. Chuyển đổi ngày Việt → English: "Thứ 2" → "Monday", "Thứ 3" → "Tuesday", ...
2. Chuyển đổi tiết → giờ theo bảng:
   - Tiết 1 = 07:30-08:15
   - Tiết 2 = 08:15-09:00
   - Tiết 3 = 09:00-09:45
   - Tiết 4 = 10:00-10:45 (nghỉ 15 phút)
   - Tiết 5 = 10:45-11:30
   - Tiết 6 = 11:30-12:15
   - Tiết 7 = 12:45-13:30 (nghỉ trưa)
   - Tiết 8 = 13:30-14:15
   - Tiết 9 = 14:15-15:00
   - Tiết 10 = 15:15-16:00 (nghỉ 15 phút)
   - Tiết 11 = 16:00-16:45
   - Tiết 12 = 16:45-17:30

### Nhiệm vụ 2: Generate Study Plan

**Mục tiêu:** Tạo lịch học tối ưu cho N tuần

**Quy tắc tuyệt đối:**

#### A. Về Ngày tháng (DATE RULES) - CỰC KỲ QUAN TRỌNG

```
🚨 RULE 1: Lịch LUÔN bắt đầu từ NGÀY MAI (không phải hôm nay)
🚨 RULE 2: Task PHẢI được schedule TRƯỚC ngày deadline (không phải vào ngày deadline)
🚨 RULE 3: Task KHÔNG được schedule vào ngày QUÁ KHỨ
```

**Ví dụ:**
- Hôm nay: 2025-11-15
- Start date: 2025-11-16 (ngày mai)
- Deadline: 2025-11-20
- Valid dates: 2025-11-16, 2025-11-17, 2025-11-18, 2025-11-19
- Invalid dates: 2025-11-15 (hôm nay), 2025-11-20 (deadline day), 2025-11-21 (sau deadline)

#### B. Về Thời gian (TIME RULES)

```
🚨 RULE 4: KHÔNG schedule vào các slot trong timetable (lịch học cứng)
🚨 RULE 5: Tổng giờ học = estimatedHours (chính xác, sai số < 0.5h)
🚨 RULE 6: Mỗi session: 1-2 giờ (không quá dài)
🚨 RULE 7: Tuân thủ hardLimits (noAfter23, noSundays)
```

#### C. Về "Yếu môn" (WEAK SUBJECT DETECTION)

```
🚨 RULE 8: Nếu details chứa "yếu", "weak", "chưa có nền"
         → Tăng estimatedHours lên 30%
         → Ưu tiên schedule sớm hơn
```

**Ví dụ:**
```javascript
// Input
{
  title: "Bài tập Toán",
  estimatedHours: 4,
  details: "Em yếu môn này"
}

// AI phải tính
actualHours = 4 * 1.3 = 5.2 giờ
```

#### D. Về Study Mode (MODE NEGOTIATION)

```
🚨 RULE 9: Điều chỉnh lifestyle dựa trên studyMode và urgency
```

| Study Mode | Sleep Hours | Meal Duration | Workload Capacity |
|------------|-------------|---------------|-------------------|
| relaxed    | 8h (giữ nguyên) | 60+60=120min | Thấp |
| normal     | 7h (giảm 1h) | 45+45=90min | Trung bình |
| sprint     | 6h (giảm 2h) | 30+30=60min | Cao |

**Logic thương lượng:**
```
IF studyMode == 'sprint' AND urgentDeadlines > 0:
  sleepHours = max(6, lifestyle.sleepHours - 2)
  lunchDuration = 30
  dinnerDuration = 30
  
ELSE IF studyMode == 'normal':
  sleepHours = max(7, lifestyle.sleepHours - 1)
  lunchDuration = 45
  dinnerDuration = 45
  
ELSE: // relaxed
  sleepHours = lifestyle.sleepHours
  lunchDuration = lifestyle.lunchDuration
  dinnerDuration = lifestyle.dinnerDuration
```

---

## 📤 OUTPUT FORMAT

### Format 1: Multi-Week Schedule

```json
{
  "workloadAnalysis": {
    "score": 7,
    "warning": "Bạn có 3 deadline khẩn cấp trong tuần này",
    "strategy": "Ưu tiên Bài tập Toán (yếu môn) → tăng 30% thời gian"
  },
  "weeks": [
    {
      "weekNumber": 1,
      "startDate": "2025-11-16",
      "endDate": "2025-11-22",
      "days": {
        "Sunday": [],
        "Monday": [
          {
            "time": "08:00 - 09:30",
            "activity": "Study: Bài tập Toán (yếu môn)",
            "category": "study",
            "priority": "high"
          },
          {
            "time": "14:00 - 15:30",
            "activity": "Continue: Bài tập Toán",
            "category": "study",
            "priority": "high"
          }
        ],
        "Tuesday": [
          {
            "time": "09:00 - 10:30",
            "activity": "Study: Báo cáo Web",
            "category": "study",
            "priority": "medium"
          }
        ],
        "Wednesday": [],
        "Thursday": [],
        "Friday": [],
        "Saturday": []
      }
    }
  ]
}
```

### Workload Analysis

```typescript
interface WorkloadAnalysis {
  score: number;      // 1-10 (1=rất nhẹ, 10=quá tải)
  warning: string;    // Cảnh báo cho sinh viên
  strategy: string;   // Chiến lược AI đã áp dụng
}
```

**Cách tính score:**
```
totalHours = sum(deadline.estimatedHours)
availableHours = (24 - sleepHours - mealHours - timetableHours) * numDays

workloadRatio = totalHours / availableHours

IF workloadRatio < 0.3: score = 1-3 (nhẹ)
IF workloadRatio < 0.6: score = 4-6 (vừa)
IF workloadRatio < 0.8: score = 7-8 (nặng)
IF workloadRatio >= 0.8: score = 9-10 (quá tải)
```

---

## 🎨 PROMPT TEMPLATE CHÍNH XÁC

### Prompt cho Generate Study Plan

```
Tạo lịch học thông minh cho sinh viên.

📅 NGÀY THÁNG (TUYỆT ĐỐI)
- Hôm nay: {today}
- Bắt đầu: {startDate} (NGÀY MAI)
- Kết thúc: {endDate}

🚨 QUY TẮC NGÀY:
1. KHÔNG schedule vào {today} (hôm nay)
2. KHÔNG schedule vào ngày deadline
3. CHỈ schedule trong khoảng [{startDate}, {endDate})

📚 DEADLINES:
{deadlines.map(d => {
  const dueDate = new Date(d.dueDate);
  const lastValidDay = new Date(dueDate);
  lastValidDay.setDate(dueDate.getDate() - 1);
  
  // Detect weak subject
  const isWeak = d.details?.match(/yếu|weak|chưa có nền/i);
  const actualHours = isWeak ? d.estimatedHours * 1.3 : d.estimatedHours;
  
  // Calculate valid dates
  const validDates = [];
  let currentDate = new Date(startDate);
  while (currentDate < dueDate) {
    validDates.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return `
${d.title}:
  - Deadline: ${d.dueDate}
  - Estimated: ${d.estimatedHours}h ${isWeak ? `→ YẾU MÔN → ${actualHours}h` : ''}
  - Details: ${d.details || 'N/A'}
  - Type: ${d.type}
  ${d.fixedTime ? `- Fixed time: ${d.fixedTime}` : ''}
  
  ✅ VALID DATES (CHỈ dùng những ngày này):
  ${validDates.join(', ')}
  
  ❌ INVALID: ${dueDate.toISOString().split('T')[0]} (deadline day) và sau đó
  `;
})}

🗓️ THỜI KHÓA BIỂU (KHÔNG được schedule vào):
{timetable.map(slot => 
  `${slot.day} ${slot.startTime}-${slot.endTime}: ${slot.title}`
).join('\n')}

⚙️ PREFERENCES:
- Study Mode: {studyMode}
- Sleep: {lifestyle.sleepHours}h (có thể điều chỉnh theo mode)
- Meals: {lifestyle.lunchDuration + lifestyle.dinnerDuration}min

🚫 HARD LIMITS:
{hardLimits.noAfter23 ? '- KHÔNG học sau 23:00' : ''}
{hardLimits.noSundays ? '- KHÔNG học Chủ nhật' : ''}

📊 TUẦN CẦN TẠO:
{weekDates.map(w => `
Week ${w.weekNum}: ${w.start} → ${w.end}
  Sunday = ${w.start}
  Monday = ${new Date(w.start).setDate(new Date(w.start).getDate() + 1)}
  ...
`).join('\n')}

🎯 YÊU CẦU:
1. Tổng giờ học = estimatedHours (chính xác)
2. Mỗi session: 1-2h
3. Ưu tiên deadline gần và "yếu môn"
4. Điều chỉnh sleep/meal theo studyMode
5. Tránh xung đột với timetable

OUTPUT JSON:
{
  "workloadAnalysis": {
    "score": 1-10,
    "warning": "...",
    "strategy": "..."
  },
  "weeks": [
    {
      "weekNumber": 1,
      "startDate": "{weekDates[0].start}",
      "endDate": "{weekDates[0].end}",
      "days": {
        "Sunday": [],
        "Monday": [
          {
            "time": "08:00 - 09:30",
            "activity": "Study: ...",
            "category": "study",
            "priority": "high"
          }
        ],
        ...
      }
    }
  ]
}
```

---

## ✅ VALIDATION CHECKLIST

Sau khi AI generate, backend sẽ validate:

```javascript
// 1. Check date boundaries
tasks.forEach(task => {
  const taskDate = parseDate(task.date);
  
  if (taskDate < startDate) {
    console.error(`❌ Task before start date: ${task.activity}`);
    removeTask(task);
  }
  
  if (taskDate >= deadline.dueDate) {
    console.error(`❌ Task on/after deadline: ${task.activity}`);
    removeTask(task);
  }
});

// 2. Check total hours
const totalHours = calculateTotalHours(tasks);
const diff = Math.abs(totalHours - deadline.estimatedHours);

if (diff > 0.5) {
  console.warn(`⚠️ Hours mismatch: ${totalHours}h vs ${deadline.estimatedHours}h`);
}

// 3. Check timetable conflicts
tasks.forEach(task => {
  const hasConflict = timetable.some(slot => 
    slot.day === task.day && 
    timeOverlap(slot.startTime, slot.endTime, task.startTime, task.endTime)
  );
  
  if (hasConflict) {
    console.error(`❌ Conflict with timetable: ${task.activity}`);
    removeTask(task);
  }
});

// 4. Check hard limits
if (hardLimits.noAfter23) {
  tasks.forEach(task => {
    if (task.endTime > '23:00') {
      console.error(`❌ Violates noAfter23: ${task.activity}`);
      removeTask(task);
    }
  });
}

if (hardLimits.noSundays) {
  tasks.forEach(task => {
    if (task.day === 'Sunday') {
      console.error(`❌ Violates noSundays: ${task.activity}`);
      removeTask(task);
    }
  });
}
```

---

## 🎯 KẾT LUẬN

**AI cần hiểu:**
1. **Ngày tháng là tuyệt đối** - Không được sai
2. **"Yếu môn" = tăng 30%** - Phải detect và điều chỉnh
3. **Study mode = thương lượng** - Điều chỉnh sleep/meal
4. **Timetable = cứng** - Không được xung đột
5. **Hard limits = tuyệt đối** - Không được vi phạm

**Output phải:**
- JSON valid
- Dates chính xác
- Hours chính xác
- Không xung đột
- Có workload analysis

**Nếu AI không chắc chắn:**
- Ưu tiên an toàn (schedule ít hơn)
- Đưa ra warning rõ ràng
- Giải thích strategy
