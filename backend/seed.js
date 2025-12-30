// Run: node seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Course = require('./models/Course');
const Module = require('./models/Module');
const Lesson = require('./models/Lesson');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('connected');

  const pw = await bcrypt.hash('password123', 10);
  const instr = await User.findOneAndUpdate({ email: 'alice@instructor.test' }, { email: 'alice@instructor.test', password_hash: pw, role: 'instructor', full_name: 'Alice Instructor' }, { upsert: true, new: true });
  const student = await User.findOneAndUpdate({ email: 'bob@student.test' }, { email: 'bob@student.test', password_hash: pw, role: 'student', full_name: 'Bob Student' }, { upsert: true, new: true });

  const course = await Course.findOneAndUpdate({ title: 'Intro to Web Dev' }, {
    title: 'Intro to Web Dev', description: 'Beginner course', price: 199, published_status: 'published', instructor_id: instr._id
  }, { upsert: true, new: true });

  const m1 = await Module.findOneAndUpdate({ title: 'Getting Started', course_id: course._id }, { title: 'Getting Started', course_id: course._id, order_index: 1 }, { upsert: true, new: true });
  const m2 = await Module.findOneAndUpdate({ title: 'Core', course_id: course._id }, { title: 'Core', course_id: course._id, order_index: 2 }, { upsert: true, new: true });

  await Lesson.findOneAndUpdate({ title: 'Overview' }, { title: 'Overview', module_id: m1._id, video_url: 'https://test-asset.example/video/overview.m3u8', is_free_preview: true, order_index: 1 }, { upsert: true });
  await Lesson.findOneAndUpdate({ title: 'Setup' }, { title: 'Setup', module_id: m1._id, video_url: 'https://test-asset.example/video/setup.m3u8', is_free_preview: false, order_index: 2 }, { upsert: true });
  await Lesson.findOneAndUpdate({ title: 'HTML Basics' }, { title: 'HTML Basics', module_id: m2._id, video_url: 'https://test-asset.example/video/html.m3u8', is_free_preview: false, order_index: 1 }, { upsert: true });

  console.log('seed complete');
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
