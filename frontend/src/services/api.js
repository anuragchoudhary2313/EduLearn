const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// 1. Public Course List (with Search & Filter)
export async function getCoursesList(search = '', minPrice = '', maxPrice = '') {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (minPrice) params.append('minPrice', minPrice);
  if (maxPrice) params.append('maxPrice', maxPrice);

  const r = await fetch(`${API}/api/courses_public?${params.toString()}`);
  if (!r.ok) throw new Error('Failed to fetch courses');
  return r.json();
}

// 2. Get Single Course
export async function getCourseWithModules(courseId, token) {
  const r = await fetch(`${API}/api/courses/${courseId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!r.ok) throw new Error('Failed to load course');
  return r.json();
}

// 3. Enroll (Mock)
export async function enrollCourse(token, courseId) {
  const r = await fetch(`${API}/api/enroll`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json', 
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify({ course_id: courseId })
  });
  if (!r.ok) throw new Error('Failed to enroll');
  return r.json();
}

// 4. Save Progress
export async function saveProgress(token, lessonId, lastWatched, isCompleted=false) {
  const r = await fetch(`${API}/api/progress`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json', 
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify({ 
      lesson_id: lessonId, 
      last_watched_position: lastWatched, 
      is_completed: isCompleted 
    })
  });
  if (!r.ok) throw new Error('Failed to save progress');
  return r.json();
}

// 5. Instructor Stats
export async function getInstructorStats(token) {
  const r = await fetch(`${API}/api/instructor/stats`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!r.ok) throw new Error('Failed to fetch stats');
  return r.json();
}

// 6. File Upload (Cloudinary)
export async function uploadFile(token, file) {
  const formData = new FormData();
  formData.append('file', file);

  const r = await fetch(`${API}/api/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });
  if (!r.ok) throw new Error('Upload failed');
  return r.json();
}

// 7. Quiz Functions
export async function generateQuizFromPdf(token, file) {
  const formData = new FormData();
  formData.append('file', file);

  const r = await fetch(`${API}/api/instructor/quiz/generate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });
  if (!r.ok) throw new Error('Failed to generate quiz');
  return r.json();
}

export async function saveQuiz(token, quizData) {
  const r = await fetch(`${API}/api/instructor/quiz`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(quizData)
  });
  if (!r.ok) throw new Error('Failed to save quiz');
  return r.json();
}

export async function getQuizzes(token, courseId) {
  const r = await fetch(`${API}/api/courses/${courseId}/quizzes`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!r.ok) return [];
  return r.json();
}