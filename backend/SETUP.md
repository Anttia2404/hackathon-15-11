# Smart University Backend - Setup Guide

## 📦 Installation Steps

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup PostgreSQL Database

**Create database:**

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE smart_university;

# Exit
\q
```

**Or using createdb command:**

```bash
createdb -U postgres smart_university
```

### 3. Configure Environment Variables

```bash
# Copy example env file
cp .env.example .env

# Edit .env file with your configuration
# Update these values:
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smart_university
DB_USER=postgres
DB_PASSWORD=your_actual_password
JWT_SECRET=your_secure_jwt_secret_key
```

### 4. Run Database Migrations

```bash
npm run migrate
```

This will create all tables, views, and database structure.

### 5. Seed Database (Optional)

```bash
npm run seed
```

This will populate the database with sample data including:

- Admin, teacher, and student users
- Courses and classes
- Sample deadlines and study plans

**Sample Login Credentials:**

- Admin: `admin@university.edu` / `password123`
- Teacher: `nguyen.van.a@university.edu` / `password123`
- Student: `minhanh@student.edu` / `password123`

### 6. Start Development Server

```bash
npm run dev
```

Server will start on: `http://localhost:5000`

## 🧪 Testing the API

### Check Server Health

```bash
curl http://localhost:5000/api/v1/health
```

### Register New User

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@student.edu",
    "password": "password123",
    "full_name": "Test Student",
    "user_type": "student",
    "major": "Computer Science"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "minhanh@student.edu",
    "password": "password123"
  }'
```

### Get Student Dashboard (with token)

```bash
curl http://localhost:5000/api/v1/students/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📁 Project Structure

```
backend/
├── database/
│   ├── schema.sql           # PostgreSQL schema
│   ├── migrations/
│   │   └── run-migrations.js
│   └── seeds/
│       └── run-seeds.js
├── logs/                    # Application logs
├── src/
│   ├── config/
│   │   └── database.js      # Sequelize config
│   ├── controllers/         # Route controllers
│   │   ├── authController.js
│   │   ├── studentController.js
│   │   ├── teacherController.js
│   │   └── quizController.js
│   ├── middleware/          # Custom middleware
│   │   ├── auth.js
│   │   ├── validate.js
│   │   └── errorHandler.js
│   ├── models/              # Sequelize models
│   │   ├── User.js
│   │   ├── Student.js
│   │   ├── Teacher.js
│   │   ├── Course.js
│   │   ├── Class.js
│   │   ├── Deadline.js
│   │   ├── StudyPlan.js
│   │   ├── Quiz.js
│   │   └── index.js
│   ├── routes/              # API routes
│   │   ├── authRoutes.js
│   │   ├── studentRoutes.js
│   │   ├── teacherRoutes.js
│   │   ├── quizRoutes.js
│   │   └── index.js
│   ├── services/            # Business logic
│   ├── utils/               # Utility functions
│   │   ├── logger.js
│   │   └── apiResponse.js
│   ├── app.js               # Express app
│   └── server.js            # Server entry
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 🔐 API Authentication

All protected routes require JWT token in Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 🌐 Main API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/logout` - Logout

### Students

- `GET /api/v1/students/dashboard` - Student dashboard
- `GET /api/v1/students/deadlines` - Get deadlines
- `POST /api/v1/students/deadlines` - Create deadline
- `PUT /api/v1/students/deadlines/:id` - Update deadline
- `GET /api/v1/students/study-plans` - Get study plans

### Teachers

- `GET /api/v1/teachers/dashboard` - Teacher dashboard
- `GET /api/v1/teachers/at-risk-students` - Get at-risk students
- `POST /api/v1/teachers/attendance` - Mark attendance

### Quizzes

- `POST /api/v1/quizzes/generate` - Generate AI quiz
- `GET /api/v1/quizzes/teacher` - Get teacher's quizzes
- `GET /api/v1/quizzes/:id` - Get quiz by ID

## 🐛 Troubleshooting

### Database Connection Error

- Check PostgreSQL is running: `pg_isready`
- Verify credentials in `.env`
- Ensure database exists

### Port Already in Use

```bash
# Change PORT in .env file
PORT=5001
```

### Migration Errors

```bash
# Drop and recreate database
dropdb smart_university
createdb smart_university
npm run migrate
```

## 📝 Development Commands

```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
npm run migrate  # Run database migrations
npm run seed     # Seed database with sample data
npm run lint     # Run ESLint
npm run format   # Format code with Prettier
```

## 🚀 Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Update `JWT_SECRET` to a strong secret
3. Configure database connection for production
4. Set appropriate CORS origins
5. Enable SSL/TLS for PostgreSQL connection
6. Use environment variables from hosting platform

## 📚 Database Schema Overview

**Main Tables:**

- `users` - All users (students, teachers, admins)
- `students` - Student-specific data
- `teachers` - Teacher-specific data
- `courses` - Course catalog
- `classes` - Class instances
- `class_enrollments` - Student enrollments
- `deadlines` - Student deadlines
- `study_plans` - AI-generated study plans
- `quizzes` - Quiz definitions
- `attendance` - Attendance records
- `ai_summaries` - AI-generated summaries
- `flashcards` - Study flashcards

See `database/schema.sql` for complete schema.
