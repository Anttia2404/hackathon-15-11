# 🧪 Test Flow - Smart Scheduler với Gemini AI

## 📋 Chuẩn bị

Database đã được xóa sạch. Bây giờ test từ đầu theo đúng lý thuyết.

## 🎯 Flow Test Đầy Đủ

### Bước 1: Khởi động Backend & Frontend

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Đợi cả 2 khởi động xong.

---

### Bước 2: Import Thời Khóa Biểu (Timetable)

1. Mở browser: http://localhost:5173
2. Vào tab **"Context"**
3. Paste text này vào ô import:

```
Monday 8:00-10:00 Calculus II - Room A101
Monday 14:00-16:00 Physics Lab - Lab B203
Tuesday 9:00-11:00 Data Structures - Room C305
Wednesday 14:00-16:00 Database Systems - Room D401
Thursday 8:00-10:00 Web Programming - Room E502
Friday 10:00-12:00 Software Engineering - Room F601
```

4. Click **"Import with AI"**
5. Xem preview → Click **"Apply"**
6. ✅ Thời khóa biểu xuất hiện trong grid

**Kiểm tra DB:**
```bash
cd backend
node check-timetable.js
```

Kỳ vọng: Thấy 6 slots trong `timetable_slots` (official class schedule)

---

### Bước 3: Thêm Deadlines

1. Vào tab **"Generator"**
2. Thêm deadline 1:
   - Tên: `Bài tập Toán`
   - Hạn chót: `2025-11-20` (4 ngày sau)
   - Số giờ: `4`
   - Chi tiết: `Em yếu môn này, cần ôn lại từ đầu`
   - Loại: `Tự học (linh hoạt)`
   - Click **"Thêm Deadline"**

3. Thêm deadline 2:
   - Tên: `Báo cáo Web`
   - Hạn chót: `2025-11-22` (6 ngày sau)
   - Số giờ: `6`
   - Chi tiết: `Làm theo nhóm`
   - Loại: `Tự học (linh hoạt)`
   - Click **"Thêm Deadline"**

4. ✅ Thấy 2 deadlines trong danh sách

**Kiểm tra DB:**
```bash
node backend/seed-demo-student.js  # Nếu chưa có student
```

---

### Bước 4: Cấu hình Preferences

1. Trong tab **"Generator"**, xem phần **"Sleep & Meal Settings"**:
   - Sleep: `7h`
   - Lunch: `45min`
   - Dinner: `45min`

2. Chọn **Study Mode**: `Normal` (📚)

3. Trong **"Hard Limits"**:
   - ☑️ Check: `Do not schedule after 23:00`
   - ☐ Uncheck: `Do not study on Sundays`

---

### Bước 5: Generate AI Schedule

1. Click nút lớn: **"Generate AI Study Plan"**
2. Đợi 3-5 giây (AI đang xử lý)
3. ✅ Xem kết quả:
   - **Workload Analysis**: Score, Warning, Strategy
   - **Calendar View**: Lịch học theo tuần

**Kiểm tra console log:**
```
📅 Date calculation:
   Today: 2025-11-15
   Start date: 2025-11-16 (tomorrow)

📊 ===== AI INPUT =====
Valid Deadlines: 2
1. "Bài tập Toán" - 4h - Due: 2025-11-20 (5 days)
2. "Báo cáo Web" - 6h - Due: 2025-11-22 (7 days)

🔍 STRICT Validation...
✅ All tasks are valid

📊 Hours validation:
✅ "Bài tập Toán": 4.0h / 4h
✅ "Báo cáo Web": 6.0h / 6h

✅ Saved 2 task(s) for 2025-11-16
✅ Saved 3 task(s) for 2025-11-17
✅ All AI plans saved to database
```

**Kiểm tra DB:**
```bash
node backend/check-study-plans.js
```

Kỳ vọng:
- Thấy nhiều study plans (1 plan/ngày)
- Mỗi plan có tasks với startTime, endTime
- Tasks KHÔNG xung đột với timetable
- Tasks phân bổ đều (không dồn vào 1 ngày)

---

### Bước 6: Reload Test (Kiểm tra persistence)

1. **Reload trang** (Ctrl+R hoặc F5)
2. ✅ Kiểm tra:
   - Thời khóa biểu vẫn còn (tab Context)
   - Deadlines vẫn còn (tab Generator)
   - AI Schedule vẫn còn (calendar view)

**Console log khi reload:**
```
📥 Loading plans from DB: X days
✅ Loaded X week(s) from database
```

---

## ✅ Checklist Kết Quả

### Database
- [ ] `timetable_slots`: Có 6 slots (imported timetable)
- [ ] `deadlines`: Có 2 deadlines
- [ ] `study_plans`: Có nhiều plans (1/ngày)
- [ ] `study_plan_tasks`: Có nhiều tasks
- [ ] `student_preferences`: Có preferences

### AI Behavior
- [ ] AI phát hiện "yếu môn" → tăng 30% thời gian
- [ ] AI tránh xung đột với timetable
- [ ] AI phân bổ đều (không dồn vào 1 ngày)
- [ ] AI tuân thủ hard limits (không sau 23:00)
- [ ] AI schedule từ ngày mai (không phải hôm nay)

### Frontend
- [ ] Import timetable hoạt động
- [ ] Add deadline hoạt động
- [ ] Generate AI schedule hoạt động
- [ ] Reload không mất dữ liệu
- [ ] Calendar hiển thị đúng

---

## 🐛 Troubleshooting

### Lỗi: "No valid deadlines"
→ Deadline quá gần (< 1 ngày) hoặc đã quá hạn
→ Thêm deadline xa hơn (3-7 ngày)

### Lỗi: "All tasks removed"
→ AI schedule vào ngày không hợp lệ
→ Check console log validation

### Lỗi: "Failed to save"
→ Backend không chạy
→ Check terminal backend có lỗi không

### Reload mất dữ liệu
→ API save không được gọi
→ Check Network tab trong DevTools

---

## 📊 Expected Results

### AI Schedule Example:
```
Week 1: Nov 16 - Nov 22

Monday (Nov 16):
  08:00-10:00: Calculus II (TKB cứng)
  10:30-12:00: Study: Bài tập Toán - Phần 1 (1.5h)
  14:00-16:00: Physics Lab (TKB cứng)
  16:30-18:00: Continue: Bài tập Toán - Phần 2 (1.5h)

Tuesday (Nov 17):
  09:00-11:00: Data Structures (TKB cứng)
  14:00-16:00: Study: Báo cáo Web - Phần 1 (2h)
  16:30-18:00: Continue: Bài tập Toán - Phần 3 (1h)

Wednesday (Nov 18):
  08:00-10:00: Study: Báo cáo Web - Phần 2 (2h)
  14:00-16:00: Database Systems (TKB cứng)
  16:30-18:00: Continue: Báo cáo Web - Phần 3 (2h)

...
```

### Workload Analysis:
```json
{
  "score": 5,
  "warning": "Bạn có 2 deadlines, trong đó 1 môn yếu (Bài tập Toán)",
  "strategy": "Tăng 30% thời gian cho Toán (4h → 5.2h), phân bổ đều qua 3 ngày, tránh xung đột với 6 slots TKB cứng"
}
```

---

## 🎉 Success Criteria

1. ✅ Timetable lưu vào `timetable_slots`
2. ✅ Deadlines lưu vào `deadlines`
3. ✅ AI schedule lưu vào `study_plans` + `study_plan_tasks`
4. ✅ Reload không mất dữ liệu
5. ✅ AI tránh xung đột với TKB
6. ✅ AI phân bổ thông minh (không dồn)
7. ✅ AI phát hiện "yếu môn"

Nếu tất cả đều ✅ → **Hệ thống hoạt động hoàn hảo!** 🎊
