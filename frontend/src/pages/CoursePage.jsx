import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import VideoPlayer from '../components/VideoPlayer';
import { useAuth } from '../contexts/AuthContext';
import { 
  getCourseWithModules, 
  enrollCourse, 
  generateQuizFromPdf, 
  saveQuiz, 
  getQuizzes 
} from '../services/api';

// --- ICONS ---
const PlayIcon = () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>;
const LockIcon = () => <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>;
const FileIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>;
const PlusIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>;
const QuizIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>;
const ClockIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function CoursePage() {
  const { id } = useParams();
  const { getAccessToken, user } = useAuth();
  
  // --- STATE ---
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [isInstructor, setIsInstructor] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState('content'); 
  
  // Quiz State
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null); 
  const [currentAnswers, setCurrentAnswers] = useState({}); 
  const [quizResult, setQuizResult] = useState(null); 

  // ✅ Timer State
  const [timeLeft, setTimeLeft] = useState(null);
  const timerRef = useRef(null);

  // Builder Inputs
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [addingModule, setAddingModule] = useState(false);
  const [addingLessonToModuleId, setAddingLessonToModuleId] = useState(null);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');

  // Resources & Quiz Creator Inputs
  const [newResTitle, setNewResTitle] = useState('');
  const [newResUrl, setNewResUrl] = useState('');
  const [quizFile, setQuizFile] = useState(null);
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDuration, setQuizDuration] = useState(10); // ✅ Default 10 mins

  // --- EFFECTS ---
  useEffect(() => {
    (async () => {
      try {
        const data = await getCourseWithModules(id, getAccessToken());
        setCourse(data.course);
        setModules(data.modules);
        setEnrolled(data.enrolled);
        setIsInstructor(data.isInstructor);
        setCurrentLesson(data.modules?.[0]?.lessons?.[0] ?? null);
      } catch (err) { console.error(err); }
    })();
  }, [id]);

  useEffect(() => {
    if (course?._id) {
      getQuizzes(getAccessToken(), course._id).then(setQuizzes);
    }
  }, [course]);

  // ✅ TIMER LOGIC
  useEffect(() => {
    if (activeQuiz && !quizResult && activeQuiz.duration) {
      setTimeLeft(activeQuiz.duration * 60); // Set timer in seconds
    } else {
      setTimeLeft(null);
    }
  }, [activeQuiz, quizResult]);

  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      handleQuizSubmit(); // Auto submit
      return;
    }
    timerRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [timeLeft]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  // --- HANDLERS ---
  const handleSelectLesson = (lesson) => {
    setActiveQuiz(null);
    if (lesson.locked) { alert('🔒 This lesson is locked. Please enroll to access.'); return; }
    setCurrentLesson(lesson);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectQuiz = (quiz) => {
    setCurrentLesson(null);
    setActiveQuiz(quiz);
    setQuizResult(null); 
    setCurrentAnswers({}); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEnroll = async () => {
    try {
      const token = getAccessToken();
      await enrollCourse(token, course._id);
      alert('🎉 Successfully Enrolled!');
      setEnrolled(true);
      window.location.reload(); 
    } catch (err) { alert('Enrollment failed.'); }
  };

  // Builder Handlers
  const handleAddModule = async (e) => {
    e.preventDefault();
    const token = getAccessToken();
    await fetch(`${API}/api/instructor/modules`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ course_id: course._id, title: newModuleTitle, order_index: modules.length + 1 })
    });
    window.location.reload();
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    const token = getAccessToken();
    await fetch(`${API}/api/instructor/lessons`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ module_id: addingLessonToModuleId, title: newLessonTitle, video_url: newVideoUrl, order_index: 99 })
    });
    window.location.reload();
  };

  const handleAddResource = async (e) => {
    e.preventDefault();
    const token = getAccessToken();
    const res = await fetch(`${API}/api/instructor/courses/${course._id}/resources`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: newResTitle, url: newResUrl })
    });
    if (res.ok) {
        const updatedResources = await res.json();
        setCourse({ ...course, resources: updatedResources });
        setNewResTitle(''); setNewResUrl('');
    }
  };

  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    if (!quizFile) return alert("Please select a PDF");
    const questions = await generateQuizFromPdf(getAccessToken(), quizFile);
    setGeneratedQuiz(questions);
  };

  const handleSaveQuiz = async () => {
    // ✅ Sending duration to backend
    await saveQuiz(getAccessToken(), { 
      course_id: course._id, 
      title: quizTitle, 
      questions: generatedQuiz,
      duration: Number(quizDuration) 
    });
    alert("Quiz Saved!");
    setGeneratedQuiz(null); setQuizFile(null); setQuizTitle(''); setQuizDuration(10);
    getQuizzes(getAccessToken(), course._id).then(setQuizzes);
  };
  
  const handleAnswerChange = (qIdx, aIdx) => setCurrentAnswers({ ...currentAnswers, [qIdx]: aIdx });

  const handleQuizSubmit = async (e) => {
    if (e) e.preventDefault();
    const answersArray = activeQuiz.questions.map((_, index) => currentAnswers[index]);
    const res = await fetch(`${API}/api/student/quizzes/${activeQuiz._id}/submit`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getAccessToken()}` },
      body: JSON.stringify({ answers: answersArray })
    });
    const result = await res.json();
    setQuizResult(result);
    setTimeLeft(null); // Stop timer
  };

  if (!course) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      
      {/* --- HEADER BREADCRUMB --- */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center text-sm text-gray-500">
                <Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link>
                <span className="mx-2">/</span>
                <span className="text-gray-900 font-medium truncate">{course.title}</span>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* === LEFT COLUMN: MAIN CONTENT === */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 1. PLAYER / QUIZ CONTAINER */}
          <div className="bg-black rounded-2xl shadow-2xl overflow-hidden aspect-video relative group">
            {activeQuiz ? (
              <div className="bg-white h-full w-full p-8 overflow-y-auto relative">
                
                <div className="flex justify-between items-center border-b pb-4 mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <span className="text-purple-600"><QuizIcon/></span> {activeQuiz.title}
                  </h2>
                  {/* ✅ TIMER DISPLAY */}
                  {!quizResult && timeLeft !== null && (
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono font-bold ${timeLeft < 60 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-50 text-blue-700'}`}>
                      <ClockIcon />
                      {formatTime(timeLeft)}
                    </div>
                  )}
                </div>

                {quizResult ? (
                  <div className="flex flex-col items-center justify-center h-64 animate-fade-in">
                    <div className="text-6xl mb-4">🏆</div>
                    <h3 className="text-2xl font-bold text-gray-800">Quiz Completed!</h3>
                    <p className="text-gray-500 mt-2">You scored</p>
                    <div className="text-5xl font-extrabold text-green-500 mt-2">{quizResult.percentage.toFixed(0)}%</div>
                    <button onClick={() => setActiveQuiz(null)} className="mt-6 text-blue-600 hover:underline">Back to Content</button>
                  </div>
                ) : (
                  <form onSubmit={handleQuizSubmit} className="space-y-6 pb-10">
                    {activeQuiz.questions.map((q, idx) => (
                      <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <p className="font-semibold text-gray-800 mb-3">Q{idx + 1}. {q.questionText}</p>
                        <div className="space-y-2">
                          {q.options.map((opt, optIdx) => (
                            <label key={optIdx} className="flex items-center p-2 rounded hover:bg-white border border-transparent hover:border-gray-200 cursor-pointer transition">
                              <input type="radio" name={`q-${idx}`} checked={currentAnswers[idx] === optIdx} onChange={() => handleAnswerChange(idx, optIdx)} className="text-blue-600 focus:ring-blue-500" />
                              <span className="ml-3 text-gray-700 text-sm">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition shadow-md">Submit Answers</button>
                  </form>
                )}
              </div>
            ) : (
              <div className="h-full w-full">
                {currentLesson ? (
                   <VideoPlayer lesson={currentLesson} />
                ) : (
                   <div className="flex flex-col items-center justify-center h-full text-gray-400">
                     <svg className="w-16 h-16 mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/></svg>
                     <p>Select a lesson to start watching</p>
                   </div>
                )}
              </div>
            )}
          </div>

          {/* INFO CARD */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
                <p className="text-gray-600 leading-relaxed">{course.description}</p>
              </div>
              {!enrolled && !isInstructor && (
                 <div className="bg-blue-50 px-6 py-4 rounded-xl text-center min-w-[200px]">
                   <p className="text-2xl font-bold text-blue-900 mb-2">₹{course.price}</p>
                   <button onClick={handleEnroll} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg shadow-lg transition transform active:scale-95">Enroll Now</button>
                 </div>
              )}
            </div>
          </div>

          {/* RESOURCES SECTION */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
             <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
               <span className="p-1 bg-blue-100 rounded text-blue-600"><FileIcon/></span> Course Resources
             </h3>
             {course.resources?.length > 0 ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {course.resources.map((res, idx) => (
                   <a key={idx} href={res.url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition group">
                     <span className="font-medium text-gray-700 group-hover:text-blue-700 truncate">{res.title}</span>
                     <span className="text-gray-400 group-hover:text-blue-500">⬇</span>
                   </a>
                 ))}
               </div>
             ) : <p className="text-gray-400 italic text-sm">No resources uploaded yet.</p>}

             {isInstructor && (
               <div className="mt-6 pt-4 border-t border-dashed border-gray-200">
                 <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Instructor Area: Add Resource</h4>
                 <form onSubmit={handleAddResource} className="flex gap-3">
                   <input className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Resource Title" value={newResTitle} onChange={e=>setNewResTitle(e.target.value)} />
                   <input className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="File URL" value={newResUrl} onChange={e=>setNewResUrl(e.target.value)} />
                   <button className="bg-gray-900 text-white px-4 rounded-lg text-sm font-medium hover:bg-gray-800">Add</button>
                 </form>
               </div>
             )}
          </div>
        </div>

        {/* === RIGHT COLUMN: SIDEBAR TABS === */}
        <div className="lg:col-span-1">
           <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden sticky top-24">
              
              <div className="flex border-b border-gray-100 text-xs font-bold">
                <button onClick={() => setActiveTab('content')} className={`flex-1 py-3 transition ${activeTab === 'content' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500'}`}>LESSONS</button>
                <button onClick={() => setActiveTab('resources')} className={`flex-1 py-3 transition ${activeTab === 'resources' ? 'text-green-600 border-b-2 border-green-600 bg-green-50' : 'text-gray-500'}`}>RESOURCES</button>
                <button onClick={() => setActiveTab('quiz')} className={`flex-1 py-3 transition ${activeTab === 'quiz' ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50' : 'text-gray-500'}`}>QUIZZES</button>
              </div>

              <div className="p-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                
                {/* TAB 1: CONTENT */}
                {activeTab === 'content' && (
                  <div>
                    {modules.map((m, mIdx) => (
                      <div key={m._id} className="mb-6">
                         <h4 className="text-xs font-bold text-gray-400 uppercase mb-2 flex justify-between">
                            <span>Module {mIdx + 1}: {m.title}</span>
                            {isInstructor && <button onClick={()=>setAddingLessonToModuleId(m._id)} className="text-blue-600 hover:underline">+</button>}
                         </h4>
                         <div className="space-y-1">
                           {m.lessons.map((l, lIdx) => {
                             const isActive = currentLesson?._id === l._id;
                             return (
                               <button key={l._id} onClick={() => handleSelectLesson(l)} className={`w-full text-left flex items-center gap-3 p-3 rounded-lg transition ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-50 text-gray-700'}`}>
                                 {l.locked ? <LockIcon className={isActive ? 'text-blue-200' : 'text-gray-400'} /> : <PlayIcon className={isActive ? 'text-white' : 'text-gray-400'} />}
                                 <span className="flex-1 text-sm truncate">{l.title}</span>
                               </button>
                             );
                           })}
                         </div>
                         {isInstructor && addingLessonToModuleId === m._id && (
                           <div className="mt-2 p-2 bg-gray-50 border border-dashed rounded">
                              <input className="w-full mb-2 text-xs p-1 border" placeholder="Title" value={newLessonTitle} onChange={e=>setNewLessonTitle(e.target.value)} />
                              <input className="w-full mb-2 text-xs p-1 border" placeholder="URL" value={newVideoUrl} onChange={e=>setNewVideoUrl(e.target.value)} />
                              <button onClick={handleAddLesson} className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Save</button>
                           </div>
                         )}
                      </div>
                    ))}
                    {isInstructor && <button onClick={() => setAddingModule(!addingModule)} className="w-full py-2 border-2 border-dashed text-gray-500 rounded hover:text-blue-600">+ Add Module</button>}
                    {addingModule && (
                        <div className="mt-2">
                            <input className="w-full p-2 border mb-2" placeholder="Module Title" value={newModuleTitle} onChange={e=>setNewModuleTitle(e.target.value)}/>
                            <button onClick={handleAddModule} className="bg-blue-600 text-white px-4 py-1 rounded">Add</button>
                        </div>
                    )}
                  </div>
                )}

                {/* TAB 2: RESOURCES */}
                {activeTab === 'resources' && (
                  <div className="space-y-3">
                     {course.resources?.length > 0 ? course.resources.map((res, idx) => (
                       <a key={idx} href={res.url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-lg border hover:bg-green-50">
                         <div className="flex items-center gap-3"><FileIcon className="text-green-600"/><span className="text-sm font-medium">{res.title}</span></div>
                         <span className="text-xs text-gray-400">Download</span>
                       </a>
                     )) : <p className="text-gray-400 text-sm text-center">No resources available.</p>}
                  </div>
                )}

                {/* TAB 3: QUIZZES */}
                {activeTab === 'quiz' && (
                  <div className="space-y-3">
                     {quizzes.length > 0 ? quizzes.map(q => (
                       <button key={q._id} onClick={() => handleSelectQuiz(q)} className="w-full text-left p-3 border rounded-lg hover:bg-purple-50 flex items-center gap-3">
                          <QuizIcon className="text-purple-600"/>
                          <div>
                             <div className="font-bold text-sm">{q.title}</div>
                             <div className="text-xs text-gray-500">{q.questions.length} Qs • {q.duration} Mins</div>
                          </div>
                       </button>
                     )) : <p className="text-gray-400 text-sm text-center">No quizzes available.</p>}

                     {isInstructor && (
                        <div className="mt-4 pt-4 border-t border-dashed">
                           <h4 className="text-xs font-bold text-purple-600 uppercase mb-2">Generate Quiz</h4>
                           {!generatedQuiz ? (
                              <div className="space-y-2">
                                 <input className="w-full text-xs p-2 border rounded" placeholder="Quiz Title" value={quizTitle} onChange={e=>setQuizTitle(e.target.value)} />
                                 <input type="file" className="w-full text-xs" onChange={e => setQuizFile(e.target.files[0])} />
                                 <button onClick={handleGenerateQuiz} className="w-full bg-purple-600 text-white py-1.5 rounded text-xs font-bold">Generate</button>
                              </div>
                           ) : (
                              <div>
                                 <p className="text-xs text-green-600 mb-2">✅ Ready!</p>
                                 {/* ✅ DURATION INPUT */}
                                 <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs text-gray-500">Timer (mins):</span>
                                    <input type="number" className="w-16 text-xs border p-1 rounded" value={quizDuration} onChange={e=>setQuizDuration(e.target.value)} />
                                 </div>
                                 <div className="flex gap-2">
                                    <button onClick={handleSaveQuiz} className="flex-1 bg-green-600 text-white py-1.5 rounded text-xs font-bold">Save</button>
                                    <button onClick={()=>setGeneratedQuiz(null)} className="flex-1 bg-gray-200 text-gray-600 py-1.5 rounded text-xs">Discard</button>
                                 </div>
                              </div>
                           )}
                        </div>
                     )}
                  </div>
                )}

              </div>
           </div>
        </div>

      </div>
    </div>
  );
}