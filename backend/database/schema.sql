-- =====================================================
-- SMART UNIVERSITY DATABASE SCHEMA - POSTGRESQL
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS & AUTHENTICATION
-- =====================================================

CREATE TYPE user_type_enum AS ENUM ('student', 'teacher', 'admin');

CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    user_type user_type_enum NOT NULL,
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_type ON users(user_type);

CREATE TABLE students (
    student_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    student_code VARCHAR(50) UNIQUE NOT NULL,
    major VARCHAR(100),
    year INTEGER,
    gpa DECIMAL(3,2),
    target_gpa DECIMAL(3,2)
);

CREATE INDEX idx_students_code ON students(student_code);

CREATE TABLE teachers (
    teacher_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    teacher_code VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(100),
    specialization VARCHAR(200)
);

CREATE INDEX idx_teachers_code ON teachers(teacher_code);

-- =====================================================
-- COURSES & CLASSES
-- =====================================================

CREATE TABLE courses (
    course_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_code VARCHAR(50) UNIQUE NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    description TEXT,
    credits INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_courses_code ON courses(course_code);

CREATE TABLE classes (
    class_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES teachers(teacher_id) ON DELETE CASCADE,
    class_code VARCHAR(50) UNIQUE NOT NULL,
    semester VARCHAR(20) NOT NULL,
    year INTEGER NOT NULL,
    room VARCHAR(50),
    max_students INTEGER DEFAULT 50,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_classes_code ON classes(class_code);
CREATE INDEX idx_classes_semester_year ON classes(semester, year);

CREATE TYPE enrollment_status_enum AS ENUM ('active', 'dropped', 'completed');

CREATE TABLE class_enrollments (
    enrollment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES classes(class_id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status enrollment_status_enum DEFAULT 'active',
    final_grade DECIMAL(3,2),
    UNIQUE(class_id, student_id)
);

CREATE INDEX idx_enrollments_student ON class_enrollments(student_id, status);

-- =====================================================
-- TIMETABLE & SCHEDULE
-- =====================================================

CREATE TYPE day_of_week_enum AS ENUM ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');

CREATE TABLE timetable_slots (
    slot_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES classes(class_id) ON DELETE CASCADE,
    day_of_week day_of_week_enum NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room VARCHAR(50)
);

CREATE INDEX idx_timetable_class ON timetable_slots(class_id, day_of_week);

CREATE TABLE student_blocked_times (
    blocked_time_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    day_of_week day_of_week_enum NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_blocked_times_student ON student_blocked_times(student_id, day_of_week);

-- =====================================================
-- DEADLINES & STUDY PLAN
-- =====================================================

CREATE TYPE priority_enum AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE deadline_status_enum AS ENUM ('pending', 'in_progress', 'completed', 'overdue');

CREATE TABLE deadlines (
    deadline_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(class_id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP NOT NULL,
    estimated_hours DECIMAL(5,2),
    priority priority_enum DEFAULT 'medium',
    status deadline_status_enum DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX idx_deadlines_student ON deadlines(student_id, status, due_date);
CREATE INDEX idx_deadlines_due_date ON deadlines(due_date);

CREATE TYPE study_mode_enum AS ENUM ('relaxed', 'normal', 'sprint');

CREATE TABLE study_plans (
    plan_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    plan_date DATE NOT NULL,
    study_mode study_mode_enum DEFAULT 'normal',
    ai_summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_study_plans_student ON study_plans(student_id, plan_date);

CREATE TYPE task_category_enum AS ENUM ('study', 'break', 'meal', 'exercise', 'other');

CREATE TABLE study_plan_tasks (
    task_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID NOT NULL REFERENCES study_plans(plan_id) ON DELETE CASCADE,
    deadline_id UUID REFERENCES deadlines(deadline_id) ON DELETE SET NULL,
    task_name VARCHAR(255) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INTEGER,
    category task_category_enum DEFAULT 'study',
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP
);

CREATE INDEX idx_plan_tasks ON study_plan_tasks(plan_id);

-- =====================================================
-- LIFESTYLE & PREFERENCES
-- =====================================================

CREATE TABLE student_preferences (
    preference_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID UNIQUE NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    sleep_hours DECIMAL(3,1) DEFAULT 7.0,
    lunch_duration_minutes INTEGER DEFAULT 45,
    dinner_duration_minutes INTEGER DEFAULT 45,
    no_study_after_time TIME DEFAULT '23:00:00',
    no_study_on_sundays BOOLEAN DEFAULT FALSE,
    preferred_study_mode study_mode_enum DEFAULT 'normal',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ATTENDANCE
-- =====================================================

CREATE TYPE attendance_status_enum AS ENUM ('present', 'absent', 'late', 'excused');

CREATE TABLE attendance (
    attendance_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES classes(class_id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    status attendance_status_enum NOT NULL,
    notes TEXT,
    marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    marked_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
    UNIQUE(class_id, student_id, attendance_date)
);

CREATE INDEX idx_attendance_class ON attendance(class_id, attendance_date);
CREATE INDEX idx_attendance_student ON attendance(student_id, attendance_date);

-- =====================================================
-- STUDY MATERIALS & AI SUMMARY
-- =====================================================

CREATE TABLE study_materials (
    material_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES classes(class_id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size_kb INTEGER,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_materials_class ON study_materials(class_id);
CREATE INDEX idx_materials_uploader ON study_materials(uploaded_by);

CREATE TABLE ai_summaries (
    summary_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id UUID NOT NULL REFERENCES study_materials(material_id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    summary_text TEXT NOT NULL,
    key_insights JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_summaries_material ON ai_summaries(material_id);
CREATE INDEX idx_summaries_student ON ai_summaries(student_id);

CREATE TABLE flashcards (
    flashcard_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    summary_id UUID NOT NULL REFERENCES ai_summaries(summary_id) ON DELETE CASCADE,
    question_side TEXT NOT NULL,
    answer_side TEXT NOT NULL,
    card_order INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_flashcards_summary ON flashcards(summary_id);

-- =====================================================
-- QUIZZES & QUESTIONS
-- =====================================================

CREATE TYPE difficulty_enum AS ENUM ('easy', 'medium', 'hard', 'mixed');
CREATE TYPE question_type_enum AS ENUM ('multiple_choice', 'true_false', 'short_answer', 'essay');

CREATE TABLE quizzes (
    quiz_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES classes(class_id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES teachers(teacher_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    topic VARCHAR(255),
    difficulty difficulty_enum DEFAULT 'medium',
    total_questions INTEGER,
    time_limit_minutes INTEGER,
    is_ai_generated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_quizzes_class ON quizzes(class_id);
CREATE INDEX idx_quizzes_teacher ON quizzes(teacher_id);

CREATE TABLE quiz_questions (
    question_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type question_type_enum NOT NULL,
    options JSONB,
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    points DECIMAL(5,2) DEFAULT 1.00,
    question_order INTEGER
);

CREATE INDEX idx_questions_quiz ON quiz_questions(quiz_id, question_order);

CREATE TYPE attempt_status_enum AS ENUM ('in_progress', 'submitted', 'graded');

CREATE TABLE quiz_attempts (
    attempt_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP,
    score DECIMAL(5,2),
    max_score DECIMAL(5,2),
    status attempt_status_enum DEFAULT 'in_progress'
);

CREATE INDEX idx_attempts_quiz ON quiz_attempts(quiz_id, student_id);
CREATE INDEX idx_attempts_student ON quiz_attempts(student_id);

CREATE TABLE quiz_answers (
    answer_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID NOT NULL REFERENCES quiz_attempts(attempt_id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES quiz_questions(question_id) ON DELETE CASCADE,
    student_answer TEXT,
    is_correct BOOLEAN,
    points_earned DECIMAL(5,2),
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_answers_attempt ON quiz_answers(attempt_id);

-- =====================================================
-- ASSIGNMENTS
-- =====================================================

CREATE TABLE assignments (
    assignment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES classes(class_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP NOT NULL,
    max_score DECIMAL(5,2) DEFAULT 100.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_assignments_class ON assignments(class_id, due_date);

CREATE TYPE submission_status_enum AS ENUM ('submitted', 'graded', 'late');

CREATE TABLE assignment_submissions (
    submission_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID NOT NULL REFERENCES assignments(assignment_id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    submission_text TEXT,
    file_url VARCHAR(500),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    score DECIMAL(5,2),
    feedback TEXT,
    graded_at TIMESTAMP,
    graded_by UUID REFERENCES teachers(teacher_id) ON DELETE SET NULL,
    status submission_status_enum DEFAULT 'submitted',
    UNIQUE(assignment_id, student_id)
);

CREATE INDEX idx_submissions_assignment ON assignment_submissions(assignment_id);
CREATE INDEX idx_submissions_student ON assignment_submissions(student_id);

-- =====================================================
-- STUDY HEALTH & ANALYTICS
-- =====================================================

CREATE TABLE study_health_scores (
    score_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    score_date DATE NOT NULL,
    overall_score INTEGER,
    attendance_score INTEGER,
    assignment_completion_score INTEGER,
    performance_score INTEGER,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_health_scores_student ON study_health_scores(student_id, score_date);

CREATE TYPE risk_level_enum AS ENUM ('low', 'medium', 'high', 'critical');

CREATE TABLE at_risk_students (
    risk_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(class_id) ON DELETE CASCADE,
    risk_level risk_level_enum NOT NULL,
    attendance_rate DECIMAL(5,2),
    assignment_completion_rate DECIMAL(5,2),
    average_score DECIMAL(5,2),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

CREATE INDEX idx_risk_class ON at_risk_students(class_id, risk_level);
CREATE INDEX idx_risk_student ON at_risk_students(student_id);

-- =====================================================
-- NOTIFICATIONS
-- =====================================================

CREATE TYPE notification_type_enum AS ENUM ('deadline', 'grade', 'announcement', 'reminder', 'system');

CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type notification_type_enum NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_preferences_updated_at BEFORE UPDATE ON student_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_risk_updated_at BEFORE UPDATE ON at_risk_students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VIEWS
-- =====================================================

CREATE VIEW student_dashboard_summary AS
SELECT 
    s.student_id,
    u.full_name,
    s.gpa,
    s.target_gpa,
    COUNT(DISTINCT ce.class_id) as total_classes,
    (SELECT COUNT(*) FROM deadlines d WHERE d.student_id = s.student_id AND d.status = 'pending') as pending_deadlines,
    (SELECT overall_score FROM study_health_scores shs 
     WHERE shs.student_id = s.student_id 
     ORDER BY score_date DESC LIMIT 1) as latest_health_score
FROM students s
JOIN users u ON s.user_id = u.user_id
LEFT JOIN class_enrollments ce ON s.student_id = ce.student_id AND ce.status = 'active'
GROUP BY s.student_id, u.full_name, s.gpa, s.target_gpa;

CREATE VIEW class_performance_analytics AS
SELECT 
    c.class_id,
    c.class_code,
    co.course_name,
    COUNT(DISTINCT ce.student_id) as total_students,
    ROUND(AVG(CASE WHEN a.status = 'present' THEN 100 ELSE 0 END), 2) as avg_attendance_rate,
    COUNT(DISTINCT CASE WHEN ars.risk_level IN ('high', 'critical') THEN ars.student_id END) as at_risk_count
FROM classes c
JOIN courses co ON c.course_id = co.course_id
LEFT JOIN class_enrollments ce ON c.class_id = ce.class_id AND ce.status = 'active'
LEFT JOIN attendance a ON c.class_id = a.class_id
LEFT JOIN at_risk_students ars ON c.class_id = ars.class_id
GROUP BY c.class_id, c.class_code, co.course_name;
