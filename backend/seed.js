import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import User from './models/User.js';
import Course from './models/Course.js';
import Module from './models/Module.js';
import Lesson from './models/Lesson.js';
import Quiz from './models/Quiz.js';
import Enrollment from './models/Enrollment.js';
import Progress from './models/Progress.js';

dotenv.config();

const DEMO_PASSWORD = 'password123';
const HASH_ROUNDS = 10;

const demoUsers = [
  { email: 'alice@instructor.test', full_name: 'Alice Instructor', role: 'instructor' },
  { email: 'bob@student.test', full_name: 'Bob Student', role: 'student' },
  { email: 'maya@student.test', full_name: 'Maya Student', role: 'student' },
];

const demoCourses = [
  {
    title: 'Intro to Web Dev',
    description: 'A beginner-friendly path through HTML, CSS, and JavaScript.',
    price: 199,
    published_status: 'published',
    thumbnail_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80&auto=format&fit=crop',
    resources: [
      { title: 'Starter checklist', url: 'https://example.com/resources/web-dev-checklist.pdf' },
      { title: 'Practice project brief', url: 'https://example.com/resources/practice-project.pdf' },
    ],
    modules: [
      {
        title: 'Getting Started',
        order_index: 1,
        lessons: [
          { title: 'Course Overview', video_url: 'https://test-asset.example/video/overview.m3u8', duration: 8, is_free_preview: true, order_index: 1 },
          { title: 'Setup Your Tools', video_url: 'https://test-asset.example/video/setup.m3u8', duration: 12, is_free_preview: false, order_index: 2 },
        ],
      },
      {
        title: 'Core Skills',
        order_index: 2,
        lessons: [
          { title: 'HTML Basics', video_url: 'https://test-asset.example/video/html.m3u8', duration: 14, is_free_preview: false, order_index: 1 },
          { title: 'CSS Layouts', video_url: 'https://test-asset.example/video/css.m3u8', duration: 16, is_free_preview: false, order_index: 2 },
          { title: 'JavaScript Interactivity', video_url: 'https://test-asset.example/video/js.m3u8', duration: 18, is_free_preview: false, order_index: 3 },
        ],
      },
    ],
    quiz: {
      title: 'Web Dev Basics Quiz',
      duration: 15,
      questions: [
        { questionText: 'Which tag is used for the largest heading?', options: ['<h1>', '<h6>', '<header>', '<head>'], correctIndex: 0 },
        { questionText: 'Which CSS property controls layout direction in Flexbox?', options: ['display', 'flex-direction', 'justify-content', 'position'], correctIndex: 1 },
      ],
    },
  },
  {
    title: 'React Essentials',
    description: 'Build component-driven interfaces with modern React patterns.',
    price: 249,
    published_status: 'published',
    thumbnail_url: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200&q=80&auto=format&fit=crop',
    resources: [
      { title: 'Component patterns guide', url: 'https://example.com/resources/react-patterns.pdf' },
    ],
    modules: [
      {
        title: 'React Fundamentals',
        order_index: 1,
        lessons: [
          { title: 'Why React', video_url: 'https://test-asset.example/video/react-intro.m3u8', duration: 10, is_free_preview: true, order_index: 1 },
          { title: 'Components and Props', video_url: 'https://test-asset.example/video/react-props.m3u8', duration: 15, is_free_preview: false, order_index: 2 },
        ],
      },
      {
        title: 'State and Effects',
        order_index: 2,
        lessons: [
          { title: 'State Management', video_url: 'https://test-asset.example/video/react-state.m3u8', duration: 17, is_free_preview: false, order_index: 1 },
          { title: 'Side Effects', video_url: 'https://test-asset.example/video/react-effects.m3u8', duration: 19, is_free_preview: false, order_index: 2 },
        ],
      },
    ],
    quiz: {
      title: 'React Essentials Quiz',
      duration: 20,
      questions: [
        { questionText: 'What hook is commonly used for side effects?', options: ['useMemo', 'useEffect', 'useRef', 'useReducer'], correctIndex: 1 },
        { questionText: 'What prop is used to identify list items in React?', options: ['key', 'id', 'name', 'index'], correctIndex: 0 },
      ],
    },
  },
];

async function upsertUser(user, passwordHash) {
  return User.findOneAndUpdate(
    { email: user.email },
    { email: user.email, password_hash: passwordHash, role: user.role, full_name: user.full_name },
    { upsert: true, new: true },
  );
}

async function upsertCourse(course, instructorId) {
  return Course.findOneAndUpdate(
    { title: course.title },
    {
      title: course.title,
      description: course.description,
      price: course.price,
      thumbnail_url: course.thumbnail_url,
      published_status: course.published_status,
      instructor_id: instructorId,
      resources: course.resources,
    },
    { upsert: true, new: true },
  );
}

async function upsertModule(courseId, moduleData) {
  return Module.findOneAndUpdate(
    { course_id: courseId, title: moduleData.title },
    { course_id: courseId, title: moduleData.title, order_index: moduleData.order_index },
    { upsert: true, new: true },
  );
}

async function upsertLesson(moduleId, lessonData) {
  return Lesson.findOneAndUpdate(
    { module_id: moduleId, title: lessonData.title },
    {
      module_id: moduleId,
      title: lessonData.title,
      video_url: lessonData.video_url,
      duration: lessonData.duration,
      is_free_preview: lessonData.is_free_preview,
      order_index: lessonData.order_index,
    },
    { upsert: true, new: true },
  );
}

async function upsertQuiz(courseId, quizData) {
  return Quiz.findOneAndUpdate(
    { course_id: courseId, title: quizData.title },
    {
      course_id: courseId,
      title: quizData.title,
      duration: quizData.duration,
      questions: quizData.questions,
    },
    { upsert: true, new: true },
  );
}

async function upsertEnrollment(userId, courseId, transactionId) {
  return Enrollment.findOneAndUpdate(
    { user_id: userId, course_id: courseId },
    { user_id: userId, course_id: courseId, transaction_id: transactionId },
    { upsert: true, new: true },
  );
}

async function upsertProgress(userId, lessonId, isCompleted, lastWatchedPosition) {
  return Progress.findOneAndUpdate(
    { user_id: userId, lesson_id: lessonId },
    {
      user_id: userId,
      lesson_id: lessonId,
      is_completed: isCompleted,
      last_watched_position: lastWatchedPosition,
      updated_at: new Date(),
    },
    { upsert: true, new: true },
  );
}

async function run() {
  const mongoUri = process.env.MONGODB_URI?.trim();

  if (!mongoUri) {
    throw new Error('MONGODB_URI is required to seed the database.');
  }

  await mongoose.connect(mongoUri);

  const demoEmails = demoUsers.map((user) => user.email);
  const demoTitles = demoCourses.map((course) => course.title);
  const existingUsers = await User.find({ email: { $in: demoEmails } }).select('_id');
  const existingCourses = await Course.find({ title: { $in: demoTitles } }).select('_id');
  const existingCourseIds = existingCourses.map((course) => course._id);
  const existingModules = await Module.find({ course_id: { $in: existingCourseIds } }).select('_id');
  const existingModuleIds = existingModules.map((module) => module._id);
  const existingLessons = await Lesson.find({ module_id: { $in: existingModuleIds } }).select('_id');
  const existingLessonIds = existingLessons.map((lesson) => lesson._id);

  await Promise.all([
    Progress.deleteMany({ $or: [{ user_id: { $in: existingUsers.map((user) => user._id) } }, { lesson_id: { $in: existingLessonIds } }] }),
    Enrollment.deleteMany({ $or: [{ user_id: { $in: existingUsers.map((user) => user._id) } }, { course_id: { $in: existingCourseIds } }] }),
    Quiz.deleteMany({ course_id: { $in: existingCourseIds } }),
    Lesson.deleteMany({ _id: { $in: existingLessonIds } }),
    Module.deleteMany({ _id: { $in: existingModuleIds } }),
    Course.deleteMany({ _id: { $in: existingCourseIds } }),
    User.deleteMany({ _id: { $in: existingUsers.map((user) => user._id) } }),
  ]);

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, HASH_ROUNDS);
  const [instructor, bob, maya] = await Promise.all(demoUsers.map((user) => upsertUser(user, passwordHash)));

  const seededCourses = [];
  const lessonsByCourseTitle = new Map();
  for (const course of demoCourses) {
    const createdCourse = await upsertCourse(course, instructor._id);
    seededCourses.push(createdCourse);

    const courseLessons = [];
    for (const moduleData of course.modules) {
      const createdModule = await upsertModule(createdCourse._id, moduleData);

      for (const lessonData of moduleData.lessons) {
        const createdLesson = await upsertLesson(createdModule._id, lessonData);
        courseLessons.push(createdLesson);
      }
    }

    await upsertQuiz(createdCourse._id, course.quiz);
    lessonsByCourseTitle.set(createdCourse.title, courseLessons);
  }

  const webCourse = seededCourses[0];
  const reactCourse = seededCourses[1];
  const webLessons = lessonsByCourseTitle.get(webCourse.title) || [];
  const reactLessons = lessonsByCourseTitle.get(reactCourse.title) || [];

  await upsertEnrollment(bob._id, webCourse._id, 'txn_demo_web_001');
  await upsertEnrollment(maya._id, reactCourse._id, 'txn_demo_react_001');

  if (webLessons[0]) {
    await upsertProgress(bob._id, webLessons[0]._id, true, 480);
  }

  if (webLessons[1]) {
    await upsertProgress(bob._id, webLessons[1]._id, false, 150);
  }

  if (reactLessons[0]) {
    await upsertProgress(maya._id, reactLessons[0]._id, true, 600);
  }

  await mongoose.disconnect();
  console.log('seed complete');
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
