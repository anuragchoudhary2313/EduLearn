import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Icons
const BookIcon = () => <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>;
const FileIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>;
const QuizIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 00-2-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>;

export default function Dashboard() {
  const { user, getAccessToken } = useAuth();
  const [dashboardData, setDashboardData] = useState({ courses: [], quizzes: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('courses');

  useEffect(() => {
    if (!user) return;
    const fetchDashboard = async () => {
      try {
        const token = getAccessToken();
        const res = await fetch(`${API}/api/student/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          
          // --- FIX: Handle different response structures ---
          if (Array.isArray(data)) {
            // If backend sends an Array (Old Version), format it correctly
            setDashboardData({ courses: data, quizzes: [] });
          } else {
            // If backend sends Object (New Version), use as is
            setDashboardData(data);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [user]);

  if (!user) return <div className="p-6 flex justify-center">Loading...</div>;

  // --- FIX: Safer destructuring ---
  const courses = dashboardData?.courses || [];
  const quizzes = dashboardData?.quizzes || [];

  // Helper to extract resources safely
  const allResources = courses.flatMap(course => 
    (course.resources || []).map(res => ({ ...res, courseTitle: course.title }))
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* --- HEADER --- */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, <span className="text-blue-600">{user.full_name || user.email.split('@')[0]}</span>!
              </h1>
              <p className="text-gray-500 mt-1">Track your progress and access your materials.</p>
            </div>
            {user.role === 'instructor' && (
              <Link to="/instructor" className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-gray-800 transition">
                + Create Course
              </Link>
            )}
          </div>

          {/* TABS */}
          <div className="flex gap-8 mt-8 text-sm font-bold border-b border-transparent">
            <button 
              onClick={() => setActiveTab('courses')}
              className={`pb-3 transition ${activeTab === 'courses' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
            >
              MY COURSES ({courses.length})
            </button>
            <button 
              onClick={() => setActiveTab('resources')}
              className={`pb-3 transition ${activeTab === 'resources' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
            >
              STUDY MATERIALS ({allResources.length})
            </button>
            <button 
              onClick={() => setActiveTab('quizzes')}
              className={`pb-3 transition ${activeTab === 'quizzes' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
            >
              MOCK TESTS ({quizzes.length})
            </button>
          </div>
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="max-w-6xl mx-auto px-6 mt-8">
        
        {/* TAB 1: COURSES GRID */}
        {activeTab === 'courses' && (
          <div>
            {loading ? <p>Loading...</p> : courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <div key={course._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition group">
                    <div className="h-40 bg-gray-200 relative">
                      {course.thumbnail_url ? (
                        <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                      ) : <div className="flex items-center justify-center h-full text-gray-400">No Image</div>}
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-lg mb-2 truncate">{course.title}</h3>
                      
                      {/* Progress */}
                      <div className="mb-4">
                         <div className="flex justify-between text-xs text-gray-500 mb-1">
                           <span>Progress</span>
                           <span>{course.progressPercentage || 0}%</span>
                         </div>
                         <div className="w-full bg-gray-100 rounded-full h-2">
                           <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${course.progressPercentage || 0}%` }}></div>
                         </div>
                      </div>

                      <Link to={`/courses/${course._id}`} className="block w-full text-center bg-gray-50 text-blue-600 font-bold py-2 rounded-lg hover:bg-blue-50 transition">
                        Continue Learning
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                 <p className="text-gray-500">No courses enrolled.</p>
                 <Link to="/" className="text-blue-600 font-bold mt-2 inline-block">Browse Catalog</Link>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: GLOBAL RESOURCES */}
        {activeTab === 'resources' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {allResources.length > 0 ? (
               <div className="divide-y divide-gray-100">
                 {allResources.map((res, idx) => (
                   <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                     <div className="flex items-center gap-4">
                       <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FileIcon/></div>
                       <div>
                         <div className="font-bold text-gray-800">{res.title}</div>
                         <div className="text-xs text-gray-500">Course: {res.courseTitle}</div>
                       </div>
                     </div>
                     <a href={res.url} target="_blank" rel="noreferrer" className="px-4 py-2 text-sm font-bold text-blue-600 border border-blue-100 rounded-lg hover:bg-blue-50">Download</a>
                   </div>
                 ))}
               </div>
            ) : <div className="p-10 text-center text-gray-500">No study materials found in your courses.</div>}
          </div>
        )}

        {/* TAB 3: GLOBAL QUIZZES */}
        {activeTab === 'quizzes' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {quizzes.length > 0 ? (
               <div className="divide-y divide-gray-100">
                 {quizzes.map((quiz) => (
                   <div key={quiz._id} className="p-4 flex items-center justify-between hover:bg-purple-50 transition">
                     <div className="flex items-center gap-4">
                       <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><QuizIcon/></div>
                       <div>
                         <div className="font-bold text-gray-800">{quiz.title}</div>
                         <div className="text-xs text-gray-500">Course: {quiz.course_id?.title || 'Unknown'} • {quiz.questions.length} Questions</div>
                       </div>
                     </div>
                     <Link to={`/courses/${quiz.course_id?._id || ''}`} className="px-4 py-2 text-sm font-bold text-purple-600 border border-purple-100 rounded-lg hover:bg-purple-100">Take Test</Link>
                   </div>
                 ))}
               </div>
            ) : <div className="p-10 text-center text-gray-500">No mock tests available.</div>}
          </div>
        )}

      </div>
    </div>
  );
}