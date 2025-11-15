# 🗄️ DATABASE SETUP - POSTGRESQL

## 📋 Yêu cầu
- PostgreSQL 12+ đã cài đặt
- pgAdmin hoặc psql command line

## 🚀 Setup nhanh (5 phút)

### Bước 1: Tạo Database
```sql
CREATE DATABASE hackathon;
```

### Bước 2: Chạy Schema
```bash
cd backend
psql -U postgres -d hackathon -f database/schema.sql
```

Hoặc copy nội dung `backend/database/schema.sql` và chạy trong pgAdmin.

### Bước 3: Insert Mock Data
```sql
-- Insert test user (student)
INSERT INTO users (email, password_hash, full_name, user_type) 
VALUES ('student@test.com', '$2a$10$abcdefghijklmnopqrstuvwxyz', 'Nguyễn Văn A', 'student');

-- Get user_id
SELECT user_id FROM users WHERE email = 'student@test.com';

-- Insert student record (thay YOUR_USER_ID)
INSERT INTO students (user_id, student_code, major, year, gpa, target_gpa)
VALUES ('YOUR_USER_ID', 'SV001', 'Computer Science', 3, 3.5, 3.8);

-- Get student_id
SELECT student_id FROM students WHERE student_code = 'SV001';

-- Insert 7 days study health scores (thay YOUR_STUDENT_ID)
INSERT INTO study_health_scores (student_id, score_date, overall_score, attendance_score, assignment_completion_score, performance_score)
VALUES 
  ('YOUR_STUDENT_ID', CURRENT_DATE - INTERVAL '6 days', 30, 40, 25, 35),
  ('YOUR_STUDENT_ID', CURRENT_DATE - INTERVAL '5 days', 42, 50, 38, 45),
  ('YOUR_STUDENT_ID', CURRENT_DATE - INTERVAL '4 days', 55, 60, 52, 58),
  ('YOUR_STUDENT_ID', CURRENT_DATE - INTERVAL '3 days', 65, 70, 62, 68),
  ('YOUR_STUDENT_ID', CURRENT_DATE - INTERVAL '2 days', 72, 78, 70, 75),
  ('YOUR_STUDENT_ID', CURRENT_DATE - INTERVAL '1 day', 78, 85, 75, 80),
  ('YOUR_STUDENT_ID', CURRENT_DATE, 85, 92, 80, 85);

-- Insert course
INSERT INTO courses (course_code, course_name, credits)
VALUES ('CS101', 'Machine Learning', 3);

-- Insert teacher
INSERT INTO users (email, password_hash, full_name, user_type)
VALUES ('teacher@test.com', '$2a$10$abcdefghijklmnopqrstuvwxyz', 'Giảng viên Nguyễn', 'teacher');

INSERT INTO teachers (user_id, teacher_code, department)
SELECT user_id, 'GV001', 'Computer Science' 
FROM users WHERE email = 'teacher@test.com';

-- Insert class
INSERT INTO classes (course_id, teacher_id, class_code, semester, year)
SELECT 
  (SELECT course_id FROM courses WHERE course_code = 'CS101'),
  (SELECT teacher_id FROM teachers WHERE teacher_code = 'GV001'),
  'CS101-01', 'Fall', 2024;

-- Enroll student
INSERT INTO class_enrollments (class_id, student_id, status)
SELECT 
  (SELECT class_id FROM classes WHERE class_code = 'CS101-01'),
  'YOUR_STUDENT_ID',
  'active';

-- Insert attendance (5 days present, 1 absent)
INSERT INTO attendance (class_id, student_id, attendance_date, status)
SELECT 
  (SELECT class_id FROM classes WHERE class_code = 'CS101-01'),
  'YOUR_STUDENT_ID',
  CURRENT_DATE - INTERVAL '6 days',
  'present'
UNION ALL
SELECT 
  (SELECT class_id FROM classes WHERE class_code = 'CS101-01'),
  'YOUR_STUDENT_ID',
  CURRENT_DATE - INTERVAL '5 days',
  'present'
UNION ALL
SELECT 
  (SELECT class_id FROM classes WHERE class_code = 'CS101-01'),
  'YOUR_STUDENT_ID',
  CURRENT_DATE - INTERVAL '4 days',
  'absent'
UNION ALL
SELECT 
  (SELECT class_id FROM classes WHERE class_code = 'CS101-01'),
  'YOUR_STUDENT_ID',
  CURRENT_DATE - INTERVAL '3 days',
  'present'
UNION ALL
SELECT 
  (SELECT class_id FROM classes WHERE class_code = 'CS101-01'),
  'YOUR_STUDENT_ID',
  CURRENT_DATE - INTERVAL '2 days',
  'present'
UNION ALL
SELECT 
  (SELECT class_id FROM classes WHERE class_code = 'CS101-01'),
  'YOUR_STUDENT_ID',
  CURRENT_DATE - INTERVAL '1 day',
  'present';

-- Insert assignments
INSERT INTO assignments (class_id, title, due_date, max_score)
SELECT 
  (SELECT class_id FROM classes WHERE class_code = 'CS101-01'),
  'Bài tập tuần 1',
  CURRENT_DATE + INTERVAL '3 days',
  100;

-- Insert assignment submission
INSERT INTO assignment_submissions (assignment_id, student_id, submission_text, score, status)
SELECT 
  (SELECT assignment_id FROM assignments WHERE title = 'Bài tập tuần 1'),
  'YOUR_STUDENT_ID',
  'Đã hoàn thành bài tập',
  85,
  'graded';
```

### Bước 4: Cập nhật .env
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hackathon
DB_USER=postgres
DB_PASSWORD=your_password
```

### Bước 5: Test Connection
```bash
cd backend
npm run dev
```

Kiểm tra log: `✅ Database connection established successfully.`

## 🎯 Verify Data

### Check Study Health Scores
```sql
SELECT * FROM study_health_scores 
WHERE student_id = 'YOUR_STUDENT_ID'
ORDER BY score_date;
```

Kết quả mong đợi: 7 rows với score từ 30 → 85

### Check Attendance
```sql
SELECT 
  COUNT(*) FILTER (WHERE status = 'present') * 100.0 / COUNT(*) as attendance_rate
FROM attendance
WHERE student_id = 'YOUR_STUDENT_ID';
```

Kết quả mong đợi: ~83% (5/6 present)

### Check Assignments
```sql
SELECT 
  COUNT(*) FILTER (WHERE status IN ('submitted', 'graded')) * 100.0 / COUNT(*) as completion_rate
FROM assignment_submissions
WHERE student_id = 'YOUR_STUDENT_ID';
```

Kết quả mong đợi: 100% (1/1 submitted)

## 🔧 Troubleshooting

### Lỗi: "database does not exist"
```bash
createdb -U postgres hackathon
```

### Lỗi: "password authentication failed"
Kiểm tra password trong `.env` và PostgreSQL

### Lỗi: "relation does not exist"
Chạy lại schema.sql

## 📊 Test API Endpoints

### Get Study Health
```bash
curl http://localhost:5000/api/v1/analytics/study-health/YOUR_STUDENT_ID
```

### Get Optimal Time
```bash
curl http://localhost:5000/api/v1/analytics/optimal-time/YOUR_STUDENT_ID
```

### Get Class Analytics
```bash
curl http://localhost:5000/api/v1/analytics/class/YOUR_CLASS_ID
```

## ✅ Success Indicators

1. ✅ Database connection successful
2. ✅ 7 study health scores inserted
3. ✅ API returns real data (not mock)
4. ✅ Frontend displays chart with progression 30 → 85
5. ✅ "Cải thiện 183%" badge shows

## 🎉 Ready for Demo!

Khi setup xong, bạn sẽ thấy:
- Study Health Score: 85/100
- Chart 7 ngày: 30 → 85
- Badge: "↑ 183%"
- Insight: "Bạn đã tăng 55 điểm trong 7 ngày!"
- Attendance: 83%
- Assignment completion: 100%

---

**💡 Tip**: Nếu không có thời gian setup DB, app vẫn hoạt động với mock data!
