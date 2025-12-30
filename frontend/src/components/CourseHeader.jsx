import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function CourseHeader({ courseId, activeTab }) {
  const location = useLocation();

  // Helper to style active tabs
  const getTabClass = (tabName) => {
    const base = "px-6 py-3 text-sm font-bold transition-all border-b-2";
    return activeTab === tabName
      ? "border-blue-600 text-blue-600 bg-blue-50/50"
      : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50";
  };

  return (
    <div className="bg-white border-b border-gray-200 mb-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex space-x-4">
          <Link to={`/courses/${courseId}`} className={getTabClass('learn')}>
            📺 Learning
          </Link>
          <Link to={`/courses/${courseId}/resources`} className={getTabClass('resources')}>
            📚 Notes & Books
          </Link>
          <Link to={`/courses/${courseId}/quizzes`} className={getTabClass('quizzes')}>
            📝 Mock Tests
          </Link>
        </div>
      </div>
    </div>
  );
}