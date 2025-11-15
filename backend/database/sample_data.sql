-- ============================================
-- SAMPLE DATA FOR HACKATHON DATABASE
-- Dữ liệu mẫu để test Student & Teacher Dashboard
-- ============================================

-- Clean up existing data (optional - uncomment if needed)
-- TRUNCATE TABLE assignment_submissions, assignments, attendance, 
--   class_enrollments, timetable_slots, classes, study_health_scores, 
--   students, teachers, courses, users CASCADE;

-- ============================================
-- 1. INSERT USERS
-- ============================================

-- Insert Teacher
INSERT INTO users (email, password_hash, full_name, user_type) 
VALUES ('teacher@test.com', '$2a$10$abcdefghijklmnopqrstuvwxyz', 'Giảng viên Nguyễn', 'teacher')
ON CONFLICT (email) DO NOTHING;

-- Insert Students (45 students for realistic class)
INSERT INTO users (email, password_hash, full_name, user_type) VALUES
  ('student1@test.com', '$2a$10$abcdefghijklmnopqrstuvwxyz', 'Nguyễn Văn A', 'student'),
  ('student2@test.com', '$2a$10$abcdefghijklmnopqrstuvwxyz', 'Trần Thị B', 'student'),
  ('student3@test.com', '$2a$10$abcdefghijklmnopqrstuvwxyz', 'Lê Văn C', 'student'),
  ('student4@test.com', '$2a$10$abcdefghijklmnopqrstuvwxyz', 'Phạm Thị D', 'student'),
  ('student5@test.com', '$2a$10$abcdefghijklmnopqrstuvwxyz', 'Hoàng Văn E', 'student')
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 2. INSERT TEACHER
-- ============================================

INSERT INTO teachers (user_id, teacher_code, department)
SELECT user_id, 'GV001', 'Computer Science' 
FROM users WHERE email = 'teacher@test.com'
ON CONFLICT (teacher_code) DO NOTHING;

-- ============================================
-- 3. INSERT STUDENTS
-- ============================================

INSERT INTO students (user_id, student_code, major, year, gpa, target_gpa)
SELECT user_id, 'SV001', 'Computer Science', 3, 3.5, 3.8 FROM users WHERE email = 'student1@test.com'
UNION ALL
SELECT user_id, 'SV002', 'Computer Science', 3, 2.8, 3.5 FROM users WHERE email = 'student2@test.com'
UNION ALL
SELECT user_id, 'SV003', 'Computer Science', 3, 2.5, 3.2 FROM users WHERE email = 'student3@test.com'
UNION ALL
SELECT user_id, 'SV004', 'Computer Science', 3, 3.2, 3.6 FROM users WHERE email = 'student4@test.com'
UNION ALL
SELECT user_id, 'SV005', 'Computer Science', 3, 3.8, 4.0 FROM users WHERE email = 'student5@test.com'
ON CONFLICT (student_code) DO NOTHING;

-- ============================================
-- 4. INSERT COURSE
-- ============================================

INSERT INTO courses (course_code, course_name, credits)
VALUES ('CS101', 'Machine Learning', 3)
ON CONFLICT (course_code) DO NOTHING;

-- ============================================
-- 5. INSERT CLASS
-- ============================================

INSERT INTO classes (course_id, teacher_id, class_code, semester, year)
SELECT 
  (SELECT course_id FROM courses WHERE course_code = 'CS101'),
  (SELECT teacher_id FROM teachers WHERE teacher_code = 'GV001'),
  'CS101-01', 'Fall', 2024
ON CONFLICT (class_code) DO NOTHING;

-- ============================================
-- 6. ENROLL STUDENTS IN CLASS
-- ============================================

INSERT INTO class_enrollments (class_id, student_id, status)
SELECT 
  (SELECT class_id FROM classes WHERE class_code = 'CS101-01'),
  student_id,
  'active'
FROM students WHERE student_code IN ('SV001', 'SV002', 'SV003', 'SV004', 'SV005')
ON CONFLICT DO NOTHING;

-- ============================================
-- 7. INSERT STUDY HEALTH SCORES (7 days for each student)
-- ============================================

-- Student 1 (Excellent progression: 30 → 85)
INSERT INTO study_health_scores (student_id, score_date, overall_score, attendance_score, assignment_completion_score, performance_score)
SELECT 
  (SELECT student_id FROM students WHERE student_code = 'SV001'),
  CURRENT_DATE - INTERVAL '6 days', 30, 40, 25, 35
UNION ALL SELECT 
  (SELECT student_id FROM students WHERE student_code = 'SV001'),
  CURRENT_DATE - INTERVAL '5 days', 42, 50, 38, 45
UNION ALL SELECT 
  (SELECT student_id FROM students WHERE student_code = 'SV001'),
  CURRENT_DATE - INTERVAL '4 days', 55, 60, 52, 58
UNION ALL SELECT 
  (SELECT student_id FROM students WHERE student_code = 'SV001'),
  CURRENT_DATE - INTERVAL '3 days', 65, 70, 62, 68
UNION ALL SELECT 
  (SELECT student_id FROM students WHERE student_code = 'SV001'),
  CURRENT_DATE - INTERVAL '2 days', 72, 78, 70, 75
UNION ALL SELECT 
  (SELECT student_id FROM students WHERE student_code = 'SV001'),
  CURRENT_DATE - INTERVAL '1 day', 78, 85, 75, 80
UNION ALL SELECT 
  (SELECT student_id FROM students WHERE student_code = 'SV001'),
  CURRENT_DATE, 85, 92, 80, 85
ON CONFLICT DO NOTHING;

-- Student 2 (Needs help: 40 → 52)
INSERT INTO study_health_scores (student_id, score_date, overall_score, attendance_score, assignment_completion_score, performance_score)
SELECT 
  (SELECT student_id FROM students WHERE student_code = 'SV002'),
  CURRENT_DATE - INTERVAL '6 days', 40, 50, 35, 42
UNION ALL SELECT 
  (SELECT student_id FROM students WHERE student_code = 'SV002'),
  CURRENT_DATE - INTERVAL '5 days', 42, 52, 38, 45
UNION ALL SELECT 
  (SELECT student_id FROM students WHERE student_code = 'SV002'),
  CURRENT_DATE - INTERVAL '4 days', 45, 55, 40, 48
UNION ALL SELECT 
  (SELECT student_id FROM students WHERE student_code = 'SV002'),
  CURRENT_DATE - INTERVAL '3 days', 47, 58, 42, 50
UNION ALL SELECT 
  (SELECT student_id FROM students WHERE student_code = 'SV002'),
  CURRENT_DATE - INTERVAL '2 days', 48, 60, 43, 52
UNION ALL SELECT 
  (SELECT student_id FROM students WHERE student_code = 'SV002'),
  CURRENT_DATE - INTERVAL '1 day', 50, 62, 44, 54
UNION ALL SELECT 
  (SELECT student_id FROM students WHERE student_code = 'SV002'),
  CURRENT_DATE, 52, 65, 45, 55
ON CONFLICT DO NOTHING;

-- Student 3 (At risk: 35 → 45)
INSERT INTO study_health_scores (student_id, score_date, overall_score, attendance_score, assignment_completion_score, performance_score)
SELECT 
  (SELECT student_id FROM students WHERE student_code = 'SV003'),
  CURRENT_DATE - INTERVAL '6 days', 35, 45, 30, 38
UNION ALL SELECT 
  (SELECT student_id FROM students WHERE student_code = 'SV003'),
  CURRENT_DATE - INTERVAL '5 days', 37, 47, 32, 40
UNION ALL SELECT 
  (SELECT student_id FROM students WHERE student_code = 'SV003'),
  CURRENT_DATE - INTERVAL '4 days', 39, 49, 34, 42
UNION ALL SELECT 
  (SELECT student_id FROM students WHERE student_code = 'SV003'),
  CURRENT_DATE - INTERVAL '3 days', 40, 50, 35, 43
UNION ALL SELECT 
  (SELECT student_id FROM students WHERE student_code = 'SV003'),
  CURRENT_DATE - INTERVAL '2 days', 42, 52, 36, 45
UNION ALL SELECT 
  (SELECT student_id FROM students WHERE student_code = 'SV003'),
  CURRENT_DATE - INTERVAL '1 day', 43, 54, 37, 46
UNION ALL SELECT 
  (SELECT student_id FROM students WHERE student_code = 'SV003'),
  CURRENT_DATE, 45, 56, 38, 48
ON CONFLICT DO NOTHING;

-- Student 4 (Good: 60 → 75)
INSERT INTO study_health_scores (student_id, score_date, overall_score, attendance_score, assignment_completion_score, performance_score)
SELECT 
  (SELECT student_id FROM students WHERE student_code = 'SV004'),
  CURRENT_DATE - INTERVAL '6 days', 60, 65, 58, 62
UNION ALL SELECT 
  (SELECT student_id FROM students WHERE student_code = 'SV004'),
  CURRENT_DATE - INTERVAL '5 days', 63, 68, 61, 65
UNION ALL SELECT 
  (SELECT student_id FROM students WHERE student_code = 'SV004'),
  CURRENT_DATE - INTERVAL '4 days', 66, 70, 64, 68
UNION ALL SELECT 
  (SELECT student_id FROM students WHERE student_code = 'SV004'),
  CURRENT_DATE - INTERVAL '3 days', 69, 73, 67, 71
UNION ALL SELECT 
  (SELECT student_id FROM students WHERE student_code = 'SV004'),
  CURRENT_DATE - INTERVAL '2 days', 71, 75, 69, 73
UNION ALL SELECT 
  (SELECT student_id FROM students WHERE student_code = 'SV004'),
  CURRENT_DATE - INTERVAL '1 day', 73, 77, 71, 75
UNION ALL SELECT 
  (SELECT student_id FROM students WHERE student_code = 'SV004'),
  CURRENT_DATE, 75, 80, 73, 77
ON CONFLICT DO NOTHING;

-- Student 5 (Excellent: 75 → 90)
INSERT INTO study_health_scores (student_id, score_date, overall_score, attendance_score, assignment_completion_score, performance_score)
SELECT 
  (SELECT student_id FROM students WHERE student_code = 'SV005'),
  CURRENT_DATE - INTERVAL '6 days', 75, 80, 72, 78
UNION ALL SELECT 
  (SELECT student_id FROM students WHERE student_code = 'SV005'),
  CURRENT_DATE - INTERVAL '5 days', 78, 82, 75, 80
UNION ALL SELECT 
  (SELECT student_id FROM students WHERE student_code = 'SV005'),
  CURRENT_DATE - INTERVAL '4 days', 81, 85, 78, 83
UNION ALL SELECT 
  (SELECT student_id FROM students WHERE student_code = 'SV005'),
  CURRENT_DATE - INTERVAL '3 days', 83, 87, 80, 85
UNION ALL SELECT 
  (SELECT student_id FROM students WHERE student_code = 'SV005'),
  CURRENT_DATE - INTERVAL '2 days', 85, 89, 82, 87
UNION ALL SELECT 
  (SELECT student_id FROM students WHERE student_code = 'SV005'),
  CURRENT_DATE - INTERVAL '1 day', 87, 91, 84, 89
UNION ALL SELECT 
  (SELECT student_id FROM students WHERE student_code = 'SV005'),
  CURRENT_DATE, 90, 95, 87, 92
ON CONFLICT DO NOTHING;

-- ============================================
-- 8. INSERT ATTENDANCE (Last 7 days)
-- ============================================

-- Student 1: 6/7 present (85%)
INSERT INTO attendance (class_id, student_id, attendance_date, status)
SELECT 
  (SELECT class_id FROM classes WHERE class_code = 'CS101-01'),
  (SELECT student_id FROM students WHERE student_code = 'SV001'),
  generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day'::interval),
  CASE WHEN random() < 0.85 THEN 'present' ELSE 'absent' END
ON CONFLICT DO NOTHING;

-- Student 2: 4/7 present (57%) - at risk
INSERT INTO attendance (class_id, student_id, attendance_date, status)
SELECT 
  (SELECT class_id FROM classes WHERE class_code = 'CS101-01'),
  (SELECT student_id FROM students WHERE student_code = 'SV002'),
  generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day'::interval),
  CASE WHEN random() < 0.57 THEN 'present' ELSE 'absent' END
ON CONFLICT DO NOTHING;

-- Student 3: 3/7 present (43%) - at risk
INSERT INTO attendance (class_id, student_id, attendance_date, status)
SELECT 
  (SELECT class_id FROM classes WHERE class_code = 'CS101-01'),
  (SELECT student_id FROM students WHERE student_code = 'SV003'),
  generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day'::interval),
  CASE WHEN random() < 0.43 THEN 'present' ELSE 'absent' END
ON CONFLICT DO NOTHING;

-- Student 4: 6/7 present (85%)
INSERT INTO attendance (class_id, student_id, attendance_date, status)
SELECT 
  (SELECT class_id FROM classes WHERE class_code = 'CS101-01'),
  (SELECT student_id FROM students WHERE student_code = 'SV004'),
  generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day'::interval),
  CASE WHEN random() < 0.85 THEN 'present' ELSE 'absent' END
ON CONFLICT DO NOTHING;

-- Student 5: 7/7 present (100%)
INSERT INTO attendance (class_id, student_id, attendance_date, status)
SELECT 
  (SELECT class_id FROM classes WHERE class_code = 'CS101-01'),
  (SELECT student_id FROM students WHERE student_code = 'SV005'),
  generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day'::interval),
  'present'
ON CONFLICT DO NOTHING;

-- ============================================
-- 9. INSERT ASSIGNMENTS
-- ============================================

INSERT INTO assignments (class_id, title, description, due_date, max_score)
SELECT 
  (SELECT class_id FROM classes WHERE class_code = 'CS101-01'),
  'Bài tập tuần 1: Linear Regression',
  'Implement linear regression from scratch',
  CURRENT_DATE + INTERVAL '3 days',
  100
UNION ALL SELECT 
  (SELECT class_id FROM classes WHERE class_code = 'CS101-01'),
  'Bài tập tuần 2: Neural Networks',
  'Build a simple neural network',
  CURRENT_DATE + INTERVAL '10 days',
  100
ON CONFLICT DO NOTHING;

-- ============================================
-- 10. INSERT ASSIGNMENT SUBMISSIONS
-- ============================================

-- Student 1: Submitted both (100%)
INSERT INTO assignment_submissions (assignment_id, student_id, submission_text, score, status)
SELECT 
  assignment_id,
  (SELECT student_id FROM students WHERE student_code = 'SV001'),
  'Đã hoàn thành bài tập',
  85,
  'graded'
FROM assignments WHERE title LIKE 'Bài tập tuần 1%'
ON CONFLICT DO NOTHING;

-- Student 2: Submitted 1/2 (50%)
INSERT INTO assignment_submissions (assignment_id, student_id, submission_text, score, status)
SELECT 
  assignment_id,
  (SELECT student_id FROM students WHERE student_code = 'SV002'),
  'Đã hoàn thành bài tập',
  65,
  'graded'
FROM assignments WHERE title LIKE 'Bài tập tuần 1%'
ON CONFLICT DO NOTHING;

-- Student 3: Submitted 0/2 (0%) - at risk
-- No submissions

-- Student 4: Submitted both (100%)
INSERT INTO assignment_submissions (assignment_id, student_id, submission_text, score, status)
SELECT 
  assignment_id,
  (SELECT student_id FROM students WHERE student_code = 'SV004'),
  'Đã hoàn thành bài tập',
  78,
  'graded'
FROM assignments WHERE title LIKE 'Bài tập tuần 1%'
ON CONFLICT DO NOTHING;

-- Student 5: Submitted both (100%)
INSERT INTO assignment_submissions (assignment_id, student_id, submission_text, score, status)
SELECT 
  assignment_id,
  (SELECT student_id FROM students WHERE student_code = 'SV005'),
  'Đã hoàn thành bài tập',
  95,
  'graded'
FROM assignments WHERE title LIKE 'Bài tập tuần 1%'
ON CONFLICT DO NOTHING;

-- ============================================
-- 11. INSERT TIMETABLE (Optional - for schedule display)
-- ============================================

INSERT INTO timetable_slots (class_id, day_of_week, start_time, end_time, room)
SELECT 
  (SELECT class_id FROM classes WHERE class_code = 'CS101-01'),
  2, -- Tuesday
  '08:00:00',
  '10:00:00',
  'A101'
UNION ALL SELECT 
  (SELECT class_id FROM classes WHERE class_code = 'CS101-01'),
  4, -- Thursday
  '14:00:00',
  '16:00:00',
  'A101'
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check total students
SELECT COUNT(*) as total_students FROM students;

-- Check study health scores
SELECT 
  s.student_code,
  u.full_name,
  shs.overall_score,
  shs.score_date
FROM study_health_scores shs
JOIN students s ON shs.student_id = s.student_id
JOIN users u ON s.user_id = u.user_id
ORDER BY s.student_code, shs.score_date;

-- Check attendance rates
SELECT 
  s.student_code,
  u.full_name,
  COUNT(*) FILTER (WHERE a.status = 'present') * 100.0 / COUNT(*) as attendance_rate
FROM students s
JOIN users u ON s.user_id = u.user_id
LEFT JOIN attendance a ON s.student_id = a.student_id
GROUP BY s.student_id, s.student_code, u.full_name
ORDER BY attendance_rate;

-- Check assignment completion
SELECT 
  s.student_code,
  u.full_name,
  COUNT(DISTINCT asub.assignment_id) * 100.0 / 
    NULLIF((SELECT COUNT(*) FROM assignments WHERE class_id = (SELECT class_id FROM classes WHERE class_code = 'CS101-01')), 0) as completion_rate
FROM students s
JOIN users u ON s.user_id = u.user_id
LEFT JOIN assignment_submissions asub ON s.student_id = asub.student_id
GROUP BY s.student_id, s.student_code, u.full_name
ORDER BY completion_rate;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

SELECT '✅ Sample data inserted successfully!' as status,
       '🎓 5 students enrolled in CS101-01' as info1,
       '📊 7 days of study health scores for each student' as info2,
       '📝 Attendance and assignment data ready' as info3,
       '🚀 Ready to test Student & Teacher Dashboard!' as info4;
