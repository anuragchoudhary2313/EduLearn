import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getInstructorStats, uploadFile } from '../services/api';

// Icons
const UploadIcon = () => <svg className="w-8 h-8 text-blue-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>;
const MoneyIcon = () => <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
const UsersIcon = () => <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>;
const CourseIcon = () => <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>;

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function InstructorDashboard() {
  const { getAccessToken, user } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({ totalCourses: 0, totalStudents: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '', description: '', price: 0, thumbnail_url: ''
  });

  useEffect(() => {
    if (user?.role === 'instructor') {
      getInstructorStats(getAccessToken()).then(setStats).catch(console.error);
    }
  }, [user]);

  if (user && user.role !== 'instructor') return <div className="p-10 text-center text-red-600 font-bold">Access Denied: Instructors Only.</div>;

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const data = await uploadFile(getAccessToken(), file);
      setFormData(prev => ({ ...prev, thumbnail_url: data.url }));
    } catch (err) { alert('Upload failed'); } 
    finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/instructor/courses`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getAccessToken()}` },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      navigate(`/courses/${data._id}`); 
    } catch (err) { alert('Error creating course'); } 
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 pb-20">
      
      {/* --- HEADER & STATS --- */}
      <div className="mb-12">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Instructor Studio</h1>
        <p className="text-gray-500 mb-8">Manage your courses and track your revenue.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
            <div className="p-3 bg-green-50 rounded-xl"><MoneyIcon/></div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
            <div className="p-3 bg-blue-50 rounded-xl"><UsersIcon/></div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
            <div className="p-3 bg-purple-50 rounded-xl"><CourseIcon/></div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Active Courses</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- CREATE FORM --- */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-8 py-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Create a New Course</h2>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* 1. Course Details */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Course Title</label>
                <input 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" 
                  placeholder="e.g. Master Full-Stack Development"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" 
                  rows="4"
                  placeholder="What will students learn in this course?"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* 2. Price */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-400">₹</span>
                  <input 
                    type="number" 
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition font-mono" 
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                  />
                </div>
              </div>

              {/* 3. Image Upload Area */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Thumbnail Image</label>
                <div className="flex items-start gap-4">
                  <div className="relative group w-32 h-24 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                    {formData.thumbnail_url ? (
                      <img src={formData.thumbnail_url} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-gray-400 text-xs text-center p-2">No Image</div>
                    )}
                    {uploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><div className="animate-spin h-5 w-5 border-2 border-blue-600 rounded-full border-t-transparent"></div></div>}
                  </div>
                  
                  <div className="flex-1">
                    <label className="cursor-pointer inline-flex flex-col items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition w-full">
                      <span className="mt-2 text-xs leading-normal">Select File</span>
                      <input type='file' className="hidden" accept="image/*" onChange={handleThumbnailUpload} disabled={uploading} />
                    </label>
                    <p className="text-xs text-gray-400 mt-2">Recommended size: 1280x720</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button 
                disabled={loading || uploading}
                className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg transform transition hover:-translate-y-0.5 active:translate-y-0 ${
                  loading || uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800'
                }`}
              >
                {loading ? 'Creating Course...' : 'Create & Continue →'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}