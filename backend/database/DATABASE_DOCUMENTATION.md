# 📊 Smart University - Database Documentation

## Tổng quan

Database schema hoàn chỉnh cho hệ thống Smart University Platform với PostgreSQL 14+.

## 📁 Files

- `complete-schema.sql` - Schema SQL hoàn chỉnh (khuyến nghị sử dụng)
- `schema.sql` - Schema cơ bản (legacy)
- `migrations/` - Các migration bổ sung

## 🗂️ Cấu trúc Database

### 1. **Authentication & Users** (3 tables)
- `users` - Thông tin đăng nhập và profile
- `students` - Chi tiết sinh viên
- `teachers` - Chi tiết giảng viên

### 2. **Courses & Classes** (4 tables)
- `courses` - Danh sách môn học
- `classes` - Lớp học cụ thể
- `class_enrollments` - Đăng ký lớp
- `timetable_slots` - Thời khóa biểu cố định

### 3. **Smart Scheduler** (6 tables)
- `deadlines` - Deadline của sinh viên
- `study_plans` - Kế hoạch học tập AI
- `study_plan_tasks` - Tasks trong kế hoạch
- `student_preferences` - Preferences cá nhân
- `student_blocked_times` - Thời gian bận

### 4. **Smart Study** (3 tables)
- `study_materials` - Tài liệu học tập
- `ai_summaries` - Tóm tắt AI
- `flashcards` - Flashcards từ AI

### 5. **Quizzes & Assignments** (7 tables)
- `quizzes` - Bài quiz
- `quiz_questions` - Câu hỏi
- `quiz_attempts` - Lần làm quiz
- `quiz_answers` - Câu trả lời
- `assignments` - Bài tập
- `assignment_submissions` - Bài nộp

### 6. **Interactive Classroom** (2 tables)
- `discussions` - Hoạt động tương tác (poll, Q&A, wordcloud)
- `discussion_responses` - Phản hồi sinh viên

### 7. **Analytics & Health** (3 tables)
- `study_health_scores` - Điểm Study Health
- `at_risk_students` - Sinh viên nguy cơ
- `attendance` - Điểm danh

### 8. **Notifications** (1 table)
- `notifications` - Thông báo

## 🚀 Cài đặt

### Bước 1: Tạo Database

```bash
# Kết nối PostgreSQL
psql -U postgres

# Tạo database
CREATE DATABASE smart_university;

# Kết nối vào database
\c smart_university
```

### Bước 2: Chạy Schema

```bash
# Từ thư mục backend/database
psql -U postgres -d smart_university -f complete-schema.sql
```

Hoặc sử dụng migration script:

```bash
cd backend
npm run migrate
```

### Bước 3: Seed Data (Optional)

```bash
npm run seed
```

## 📊 Enums

Database sử dụng 16 enum types:

1. `user_type_enum` - student, teacher, admin
2. `enrollment_status_enum` - active, dropped, completed
3. `day_of_week_enum` - Monday to Sunday
4. `priority_enum` - low, medium, high, urgent
5. `deadline_status_enum` - pending, in_progress, completed, overdue
6. `study_mode_enum` - relaxed, normal, sprint
7. `task_category_enum` - study, break, meal, exercise, other
8. `attendance_status_enum` - present, absent, late, excused
9. `difficulty_enum` - easy, medium, hard, mixed
10. `question_type_enum` - multiple_choice, true_false, short_answer, essay
11. `attempt_status_enum` - in_progress, submitted, graded
12. `submission_status_enum` - submitted, graded, late
13. `risk_level_enum` - low, medium, high, critical
14. `notification_type_enum` - deadline, grade, announcement, reminder, system
15. `discussion_type_enum` - poll, qna, wordcloud, quiz, feedback
16. `discussion_status_enum` - draft, active, closed, archived

## 🔍 Views

### 1. `student_dashboard_summary`
Tổng quan dashboard sinh viên với:
- Thông tin cơ bản
- Số lớp đang học
- Số deadline pending
- Study Health score mới nhất

### 2. `class_performance_analytics`
Analytics hiệu suất lớp học:
- Tổng số sinh viên
- Tỷ lệ điểm danh trung bình
- Số sinh viên nguy cơ

### 3. `upcoming_deadlines`
Danh sách deadline sắp tới với:
- Thông tin deadline
- Thời gian còn lại (giờ)
- Thông tin lớp học

## 🔐 Indexes

Schema có 50+ indexes được tối ưu cho:
- Foreign key lookups
- Date range queries
- Status filtering
- Full-text search ready

## 🔄 Triggers

Auto-update `updated_at` cho các bảng:
- `users`
- `student_preferences`
- `at_risk_students`
- `discussions`
- `discussion_responses`

## 📈 Relationships

### Core Relationships:
```
users (1) ─── (1) students
users (1) ─── (1) teachers
courses (1) ─── (N) classes
classes (1) ─── (N) class_enrollments
students (1) ─── (N) class_enrollments
teachers (1) ─── (N) classes
```

### Smart Scheduler:
```
students (1) ─── (N) deadlines
students (1) ─── (N) study_plans
study_plans (1) ─── (N) study_plan_tasks
deadlines (1) ─── (N) study_plan_tasks
```

### Interactive Classroom:
```
teachers (1) ─── (N) discussions
classes (1) ─── (N) discussions
discussions (1) ─── (N) discussion_responses
students (1) ─── (N) discussion_responses
```

## 🎯 Key Features

### 1. UUID Primary Keys
Tất cả bảng sử dụng UUID thay vì integer để:
- Tránh collision khi merge data
- Bảo mật hơn (không đoán được ID)
- Phân tán tốt hơn

### 2. Soft Deletes
Một số bảng hỗ trợ soft delete thông qua:
- `is_active` flag
- `status` enum
- `ON DELETE SET NULL` cho foreign keys

### 3. Timestamps
Tất cả bảng có:
- `created_at` - Thời gian tạo
- `updated_at` - Thời gian cập nhật (auto-update)

### 4. JSONB Columns
Sử dụng JSONB cho dữ liệu linh hoạt:
- `discussions.settings` - Cấu hình discussion
- `discussion_responses.response_data` - Dữ liệu phản hồi
- `quiz_questions.options` - Các lựa chọn
- `ai_summaries.key_insights` - Insights từ AI

## 🔧 Maintenance

### Backup Database
```bash
pg_dump -U postgres smart_university > backup.sql
```

### Restore Database
```bash
psql -U postgres smart_university < backup.sql
```

### Check Database Size
```sql
SELECT pg_size_pretty(pg_database_size('smart_university'));
```

### Vacuum & Analyze
```sql
VACUUM ANALYZE;
```

## 📝 Notes

1. **UUID Extension**: Cần enable `uuid-ossp` extension
2. **PostgreSQL Version**: Yêu cầu PostgreSQL 14+
3. **Encoding**: UTF-8
4. **Timezone**: Khuyến nghị set timezone = 'UTC'

## 🐛 Troubleshooting

### Lỗi: "extension uuid-ossp does not exist"
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Lỗi: "type already exists"
```sql
-- Drop và tạo lại
DROP TYPE IF EXISTS user_type_enum CASCADE;
CREATE TYPE user_type_enum AS ENUM ('student', 'teacher', 'admin');
```

### Reset toàn bộ database
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

## 📞 Support

Nếu có vấn đề với database schema, vui lòng:
1. Check logs: `backend/logs/`
2. Verify connection: `backend/.env`
3. Test queries trong `psql`

---

**Version**: 1.0.0  
**Last Updated**: November 2025  
**Maintained by**: Smart University Team
