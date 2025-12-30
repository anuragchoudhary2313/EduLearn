# EduLearn - Online Learning Platform

A full-stack e-learning platform built with the MERN stack, featuring course management, video lessons, quizzes, and progress tracking.

## 🌐 Live Deployment

- **Frontend:** https://edu-learn-coral.vercel.app
- **Backend API:** https://edulearn-backend-9btj.onrender.com
- **GitHub Repository:** https://github.com/anuragchoudhary2313/EduLearn

## 🚀 Features

- **User Authentication** - Secure JWT-based authentication with access and refresh tokens
- **Course Management** - Browse, enroll, and manage courses
- **Video Lessons** - Watch course videos with progress tracking
- **Interactive Quizzes** - Test knowledge with course quizzes
- **Progress Tracking** - Track learning progress across modules and lessons
- **Instructor Dashboard** - Create and manage courses (for instructors)
- **Student Dashboard** - View enrolled courses and learning progress
- **Responsive Design** - Mobile-friendly interface with Tailwind CSS

## 🛠️ Tech Stack

### Frontend

- React 18
- React Router DOM
- Vite
- Tailwind CSS
- Axios

### Backend

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB installation
- npm or yarn package manager

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/anuragchoudhary2313/EduLearn.git
cd EduLearn
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
PORT=4000
MONGODB_URI=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_access_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=30d
FRONTEND_URL=http://localhost:5173
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in the frontend directory (if needed):

```env
VITE_API_URL=http://localhost:4000
```

## 🚀 Running the Application

### Start Backend Server

```bash
cd backend
npm run dev
```

The backend server will run on `http://localhost:4000`

### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173`

## 📊 Database Seeding

To populate the database with sample data:

```bash
cd backend
node seed.js
```

## 📁 Project Structure

```
edulearn/
├── backend/
│   ├── models/          # Mongoose schemas
│   │   ├── User.js
│   │   ├── Course.js
│   │   ├── Module.js
│   │   ├── Lesson.js
│   │   ├── Quiz.js
│   │   ├── Enrollment.js
│   │   └── Progress.js
│   ├── routes/          # API routes
│   │   ├── auth.js
│   │   └── api.js
│   ├── utils/           # Utility functions
│   │   └── jwt.js
│   ├── server.js        # Express server
│   └── seed.js          # Database seeder
│
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── contexts/    # React context (Auth)
│   │   ├── pages/       # Page components
│   │   ├── services/    # API service layer
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── index.html
│
└── README.md
```

## 🔑 Key Features Explained

### Authentication System

- JWT-based authentication with access and refresh tokens
- Secure password hashing with bcryptjs
- Protected routes for authenticated users

### Course Structure

- **Courses** contain multiple **Modules**
- **Modules** contain multiple **Lessons**
- Each lesson can have video content and resources
- **Quizzes** are associated with courses

### User Roles

- **Student** - Can enroll in courses and track progress
- **Instructor** - Can create and manage courses

## 🌐 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

### Courses

- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create course (instructor only)
- `PUT /api/courses/:id` - Update course (instructor only)

### Enrollments

- `POST /api/enrollments` - Enroll in a course
- `GET /api/enrollments` - Get user's enrollments

### Progress

- `POST /api/progress` - Update lesson progress
- `GET /api/progress/:courseId` - Get course progress

## 🎨 Screenshots

_Add screenshots of your application here_

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Anurag Choudhary**

- GitHub: [@anuragchoudhary2313](https://github.com/anuragchoudhary2313)

## 🙏 Acknowledgments

- MongoDB Atlas for database hosting
- Vercel/Netlify for potential deployment
- All contributors and users of this platform
