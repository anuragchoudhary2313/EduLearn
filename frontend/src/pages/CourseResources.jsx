import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCourseWithModules } from '../services/api'; // Re-use existing API
import CourseHeader from '../components/CourseHeader';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function CourseResources() {
  const { id } = useParams();
  const { getAccessToken } = useAuth();
  const [course, setCourse] = useState(null);
  const [isInstructor, setIsInstructor] = useState(false);
  
  // Upload State
  const [newResTitle, setNewResTitle] = useState('');
  const [newResUrl, setNewResUrl] = useState('');

  useEffect(() => {
    getCourseWithModules(id, getAccessToken()).then(data => {
      setCourse(data.course);
      setIsInstructor(data.isInstructor);
    });
  }, [id]);

  const handleAddResource = async (e) => {
    e.preventDefault();
    try {
      const token = getAccessToken();
      const res = await fetch(`${API}/api/instructor/courses/${id}/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: newResTitle, url: newResUrl })
      });
      if (res.ok) {
        const updatedResources = await res.json();
        setCourse({ ...course, resources: updatedResources });
        setNewResTitle(''); setNewResUrl('');
      }
    } catch (err) { alert('Failed to add resource'); }
  };

  if (!course) return <div className="p-10 text-center">Loading resources...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <CourseHeader courseId={id} activeTab="resources" />

      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
             <h1 className="text-2xl font-bold text-gray-900">Study Materials</h1>
             <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                {course.resources?.length || 0} Files
             </span>
          </div>

          {course.resources && course.resources.length > 0 ? (
            <div className="grid gap-4">
              {course.resources.map((res, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition group">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-100 p-2 rounded-lg text-red-500">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                    </div>
                    <span className="font-semibold text-gray-700 group-hover:text-blue-700">{res.title}</span>
                  </div>
                  <a href={res.url} target="_blank" rel="noreferrer" className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-blue-600 hover:text-white hover:border-transparent transition">
                    Download
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
               <p className="text-gray-500">No resources available for this course yet.</p>
            </div>
          )}

          {/* Instructor Upload Form */}
          {isInstructor && (
            <div className="mt-10 pt-8 border-t border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Add New Material</h3>
              <form onSubmit={handleAddResource} className="flex gap-4">
                <input className="flex-1 border p-3 rounded-xl bg-gray-50 focus:bg-white transition outline-none focus:ring-2 focus:ring-blue-500" placeholder="Document Title" value={newResTitle} onChange={e=>setNewResTitle(e.target.value)} required />
                <input className="flex-1 border p-3 rounded-xl bg-gray-50 focus:bg-white transition outline-none focus:ring-2 focus:ring-blue-500" placeholder="File URL (PDF)" value={newResUrl} onChange={e=>setNewResUrl(e.target.value)} required />
                <button className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition">Upload</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}