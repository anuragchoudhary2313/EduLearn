import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getQuizzes, generateQuizFromPdf, saveQuiz } from '../services/api';
import { getCourseWithModules } from '../services/api'; // To check instructor status
import CourseHeader from '../components/CourseHeader';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function CourseQuizzes() {
  const { id } = useParams();
  const { getAccessToken } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [isInstructor, setIsInstructor] = useState(false);
  
  // Taking Quiz State
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentAnswers, setCurrentAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);

  // Generator State
  const [quizFile, setQuizFile] = useState(null);
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [quizTitle, setQuizTitle] = useState('');

  useEffect(() => {
    // Check Role
    getCourseWithModules(id, getAccessToken()).then(data => setIsInstructor(data.isInstructor));
    // Fetch Quizzes
    getQuizzes(getAccessToken(), id).then(setQuizzes);
  }, [id]);

  // --- HANDLERS (Copied from previous CoursePage but cleaned up) ---
  const handleGenerate = async (e) => {
    e.preventDefault();
    if(!quizFile) return;
    try {
      const questions = await generateQuizFromPdf(getAccessToken(), quizFile);
      setGeneratedQuiz(questions);
    } catch(e) { alert('Error'); }
  };

  const handleSave = async () => {
    await saveQuiz(getAccessToken(), { course_id: id, title: quizTitle, questions: generatedQuiz });
    alert('Saved!');
    setGeneratedQuiz(null); setQuizTitle('');
    getQuizzes(getAccessToken(), id).then(setQuizzes);
  };

  const handleAnswerChange = (qIdx, aIdx) => setCurrentAnswers({ ...currentAnswers, [qIdx]: aIdx });

  const handleSubmitQuiz = async (e) => {
    e.preventDefault();
    const answersArray = activeQuiz.questions.map((_, index) => currentAnswers[index]);
    const res = await fetch(`${API}/api/student/quizzes/${activeQuiz._id}/submit`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getAccessToken()}` },
      body: JSON.stringify({ answers: answersArray })
    });
    const result = await res.json();
    setQuizResult(result);
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <CourseHeader courseId={id} activeTab="quizzes" />

      <div className="max-w-4xl mx-auto px-6">
        
        {/* QUIZ TAKER UI */}
        {activeQuiz ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
             <div className="flex justify-between items-center mb-6 border-b pb-4">
               <h1 className="text-2xl font-bold text-gray-900">{activeQuiz.title}</h1>
               <button onClick={()=>setActiveQuiz(null)} className="text-sm text-gray-500 hover:text-gray-900">Exit Quiz</button>
             </div>

             {quizResult ? (
               <div className="text-center py-10">
                 <div className="text-6xl mb-4">🏆</div>
                 <h2 className="text-3xl font-bold text-gray-900">Score: {quizResult.percentage.toFixed(0)}%</h2>
                 <p className="text-gray-500 mt-2">You got {quizResult.score} out of {quizResult.total} correct.</p>
                 <button onClick={()=>{setActiveQuiz(null); setQuizResult(null); setCurrentAnswers({})}} className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Finish</button>
               </div>
             ) : (
               <form onSubmit={handleSubmitQuiz} className="space-y-8">
                 {activeQuiz.questions.map((q, idx) => (
                   <div key={idx} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                     <h3 className="font-semibold text-gray-800 mb-4 text-lg">{idx+1}. {q.questionText}</h3>
                     <div className="space-y-3">
                       {q.options.map((opt, oIdx) => (
                         <label key={oIdx} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${currentAnswers[idx] === oIdx ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:bg-white'}`}>
                           <input type="radio" name={`q-${idx}`} checked={currentAnswers[idx] === oIdx} onChange={()=>handleAnswerChange(idx, oIdx)} className="text-purple-600 focus:ring-purple-500" />
                           <span className="ml-3 text-gray-700">{opt}</span>
                         </label>
                       ))}
                     </div>
                   </div>
                 ))}
                 <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl font-bold shadow-lg transition transform active:scale-95">Submit Answers</button>
               </form>
             )}
          </div>
        ) : (
          // QUIZ LIST
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Available Mock Tests</h1>
              {quizzes.length > 0 ? (
                <div className="grid gap-4">
                  {quizzes.map(q => (
                    <div key={q._id} className="flex items-center justify-between p-5 border border-gray-200 rounded-xl hover:shadow-md transition bg-white">
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">{q.title}</h3>
                        <p className="text-sm text-gray-500">{q.questions.length} Questions • 30 Mins</p>
                      </div>
                      <button onClick={()=>{setActiveQuiz(q); setQuizResult(null); setCurrentAnswers({});}} className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition">
                        Start
                      </button>
                    </div>
                  ))}
                </div>
              ) : <p className="text-gray-500 italic">No mock tests available.</p>}
            </div>

            {/* INSTRUCTOR GENERATOR */}
            {isInstructor && (
              <div className="bg-purple-50 rounded-2xl border border-purple-100 p-8">
                <h3 className="text-lg font-bold text-purple-900 mb-4">⚡ AI Quiz Generator</h3>
                {!generatedQuiz ? (
                  <form onSubmit={handleGenerate} className="space-y-4">
                    <input className="w-full border p-3 rounded-xl" placeholder="Quiz Title" value={quizTitle} onChange={e=>setQuizTitle(e.target.value)} />
                    <div className="bg-white p-4 rounded-xl border border-dashed border-purple-300 text-center">
                      <input type="file" onChange={e=>setQuizFile(e.target.files[0])} className="text-sm text-gray-500" />
                    </div>
                    <button className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold">Generate from PDF</button>
                  </form>
                ) : (
                  <div className="text-center">
                    <p className="text-green-600 font-bold mb-4">✅ Generated {generatedQuiz.length} Questions!</p>
                    <button onClick={handleSave} className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold">Save to Course</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}