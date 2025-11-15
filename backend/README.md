# Smart University Backend API

Backend REST API for Smart University Platform with AI-powered features including smart scheduling, AI summaries, and quiz generation.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Smart Scheduling**: AI-powered study schedule generation
- **AI Summaries**: Automatic document summarization with flashcards
- **Quiz Generator**: AI-powered quiz creation for teachers
- **Student Dashboard**: Health score tracking and analytics
- **Teacher Dashboard**: Class management and at-risk student monitoring
- **Real-time Notifications**: Deadline reminders and updates

## 📋 Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 14.0
- npm >= 9.0.0

## 🛠️ Installation

1. **Clone the repository**

```bash
cd backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Setup environment variables**

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Create PostgreSQL database**

```bash
createdb smart_university
```

5. **Run migrations**

```bash
npm run migrate
```

6. **Seed database (optional)**

```bash
npm run seed
```

## 🏃 Running the Application

### Development mode

```bash
npm run dev
```

### Production mode

```bash
npm start
```

The server will start on `http://localhost:5000`

## 📁 Project Structure

```
backend/
├── database/
│   ├── migrations/          # Database migrations
│   └── seeds/              # Seed data
├── src/
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/             # Sequelize models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── utils/              # Utility functions
│   ├── app.js              # Express app setup
│   └── server.js           # Server entry point
├── .env.example            # Environment variables template
└── package.json
```

## 🔌 API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Logout

### Students

- `GET /api/v1/students/dashboard` - Get student dashboard
- `GET /api/v1/students/schedule` - Get student schedule
- `POST /api/v1/students/deadlines` - Create deadline
- `GET /api/v1/students/health-score` - Get study health score

### Smart Scheduler

- `POST /api/v1/scheduler/generate` - Generate AI study plan
- `GET /api/v1/scheduler/timetable` - Get timetable
- `POST /api/v1/scheduler/preferences` - Update preferences

### AI Summary

- `POST /api/v1/ai/summarize` - Generate AI summary
- `GET /api/v1/ai/flashcards/:summaryId` - Get flashcards
- `POST /api/v1/ai/quiz/generate` - Generate quiz from summary

### Teachers

- `GET /api/v1/teachers/dashboard` - Get teacher dashboard
- `GET /api/v1/teachers/classes` - Get teacher classes
- `GET /api/v1/teachers/at-risk-students` - Get at-risk students
- `POST /api/v1/teachers/attendance` - Mark attendance

### Quiz Management

- `POST /api/v1/quizzes` - Create quiz
- `GET /api/v1/quizzes/:id` - Get quiz
- `POST /api/v1/quizzes/:id/attempt` - Submit quiz attempt

## 🗄️ Database Schema

The application uses PostgreSQL with the following main tables:

- users, students, teachers
- courses, classes, class_enrollments
- deadlines, study_plans, study_plan_tasks
- quizzes, quiz_questions, quiz_attempts
- ai_summaries, flashcards
- attendance, assignments
- study_health_scores, at_risk_students

See `database/migrations/` for detailed schema.

## 🔒 Environment Variables

See `.env.example` for all required environment variables.

## 📝 License

MIT
