import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Helper to check active link
  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md group-hover:shadow-blue-200 transition-all">
              E
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">
              EduLearn
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}
            >
              Browse
            </Link>
            
            {user ? (
              <div className="flex items-center gap-6">
                <Link 
                  to="/dashboard" 
                  className={`text-sm font-medium transition-colors ${isActive('/dashboard') ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}
                >
                  My Learning
                </Link>
                
                {user.role === 'instructor' && (
                  <Link 
                    to="/instructor" 
                    className={`text-sm font-medium transition-colors ${isActive('/instructor') ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}
                  >
                    Instructor Panel
                  </Link>
                )}

                <div className="h-6 w-px bg-slate-200 mx-2"></div>

                <div className="flex items-center gap-3">
                  <div className="text-right hidden lg:block">
                    <p className="text-xs font-bold text-slate-700">{user.full_name || 'User'}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">{user.role}</p>
                  </div>
                  <button 
                    onClick={logout}
                    className="text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-full transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/signin" className="text-sm font-medium text-slate-600 hover:text-blue-600 px-4 py-2">
                  Log in
                </Link>
                <Link 
                  to="/signup" 
                  className="text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                >
                  Join for Free
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-slate-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 absolute w-full shadow-xl">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <Link to="/" onClick={()=>setIsMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-slate-600 hover:bg-slate-50 rounded-lg">
              Browse Courses
            </Link>
            {user ? (
              <>
                <Link to="/dashboard" onClick={()=>setIsMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-slate-600 hover:bg-slate-50 rounded-lg">
                  My Dashboard
                </Link>
                {user.role === 'instructor' && (
                   <Link to="/instructor" onClick={()=>setIsMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-slate-600 hover:bg-slate-50 rounded-lg">
                    Instructor Panel
                  </Link>
                )}
                <div className="border-t border-slate-100 my-2"></div>
                <button onClick={() => { logout(); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/signin" onClick={()=>setIsMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-slate-600 hover:bg-slate-50 rounded-lg">Log In</Link>
                <Link to="/signup" onClick={()=>setIsMenuOpen(false)} className="block px-3 py-2 text-base font-bold text-blue-600 hover:bg-blue-50 rounded-lg">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}