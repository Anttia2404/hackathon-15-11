-- Create demo student for testing
-- Run this SQL in your PostgreSQL database

-- Insert demo user
INSERT INTO users (user_id, email, password_hash, full_name, user_type)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'demo@student.com',
  '$2b$10$demohashedpassword',
  'Demo Student',
  'student'
) ON CONFLICT (user_id) DO NOTHING;

-- Insert demo student
INSERT INTO students (student_id, user_id, student_code, major, year, gpa)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'DEMO001',
  'Computer Science',
  3,
  3.5
) ON CONFLICT (student_id) DO NOTHING;

-- Insert demo preferences
INSERT INTO student_preferences (student_id, sleep_hours, lunch_duration_minutes, dinner_duration_minutes)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  7,
  45,
  45
) ON CONFLICT (student_id) DO NOTHING;

SELECT 'Demo student created successfully!' as message;
