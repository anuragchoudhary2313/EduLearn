import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

// Icons
const MailIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path></svg>
);
const LockIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
);
const UserIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
);
const BadgeIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
);

export default function SignUp() {
  const { register } = useAuth();
  const nav = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [isLoading, setIsLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await register({ email, password, role });
      nav('/dashboard');
    } catch (err) {
      alert(err.message || JSON.stringify(err));
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-8 text-center">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Get Started</h2>
          <p className="text-blue-100 mt-2 text-sm">Create your account to start learning or teaching.</p>
        </div>

        {/* Form Section */}
        <div className="p-8">
          <form onSubmit={handle} className="space-y-6">
            
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">I want to join as a...</label>
              <div className="grid grid-cols-2 gap-4">
                {/* Student Card */}
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all duration-200 ${
                    role === 'student' 
                      ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' 
                      : 'border-gray-200 bg-white text-gray-500 hover:border-blue-200 hover:bg-gray-50'
                  }`}
                >
                  <div className={`mb-2 ${role === 'student' ? 'text-blue-600' : 'text-gray-400'}`}>
                    <UserIcon />
                  </div>
                  <span className="font-bold text-sm">Student</span>
                  {role === 'student' && (
                    <div className="absolute top-2 right-2 text-blue-600">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    </div>
                  )}
                </button>

                {/* Instructor Card */}
                <button
                  type="button"
                  onClick={() => setRole('instructor')}
                  className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all duration-200 ${
                    role === 'instructor' 
                      ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' 
                      : 'border-gray-200 bg-white text-gray-500 hover:border-blue-200 hover:bg-gray-50'
                  }`}
                >
                  <div className={`mb-2 ${role === 'instructor' ? 'text-blue-600' : 'text-gray-400'}`}>
                    <BadgeIcon />
                  </div>
                  <span className="font-bold text-sm">Instructor</span>
                  {role === 'instructor' && (
                    <div className="absolute top-2 right-2 text-blue-600">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MailIcon />
                </div>
                <input 
                  required 
                  type="email" 
                  placeholder="you@example.com" 
                  value={email} 
                  onChange={e=>setEmail(e.target.value)} 
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-700 bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockIcon />
                </div>
                <input 
                  required 
                  type="password" 
                  placeholder="Create a password" 
                  value={password} 
                  onChange={e=>setPassword(e.target.value)} 
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-700 bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button 
              disabled={isLoading}
              className={`w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all transform active:scale-95 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/signin" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}