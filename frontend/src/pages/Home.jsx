import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCoursesList } from '../services/api';

// Simple SVG Icons components for zero-dependency
const SearchIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
);
const FilterIcon = () => (
  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
);
const ArrowRightIcon = () => (
  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
);

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const data = await getCoursesList(search, minPrice, maxPrice);
      setCourses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCourses();
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* --- HERO SECTION --- */}
      <div className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 pt-20 pb-32 px-6 shadow-lg">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-4">
            Find Your Next <span className="text-blue-200">Superpower</span>
          </h1>
          <p className="text-blue-100 text-lg md:text-xl mb-8 font-light max-w-2xl mx-auto">
            Discover expert-led courses to build your skills and advance your career.
          </p>

          {/* Search Bar Card */}
          <form 
            onSubmit={handleSearch} 
            className="bg-white p-3 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center gap-3 max-w-3xl mx-auto transform translate-y-8"
          >
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <SearchIcon />
              </div>
              <input 
                type="text" 
                placeholder="What do you want to learn?" 
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Divider (Desktop) */}
            <div className="hidden md:block w-px h-10 bg-gray-200"></div>

            {/* Price Filters */}
            <div className="flex gap-2 w-full md:w-auto items-center">
              <div className="relative w-full md:w-28">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FilterIcon />
                </div>
                <input 
                  type="number" 
                  placeholder="Min ₹" 
                  className="w-full pl-9 pr-3 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
              </div>
              <span className="text-gray-300">-</span>
              <div className="relative w-full md:w-28">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FilterIcon />
                </div>
                <input 
                  type="number" 
                  placeholder="Max ₹" 
                  className="w-full pl-9 pr-3 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>

            {/* Action Button */}
            <button className="w-full md:w-auto bg-gray-900 hover:bg-gray-800 text-white px-8 py-3.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform active:scale-95">
              Search
            </button>
          </form>
        </div>
      </div>

      {/* --- RESULTS GRID --- */}
      <div className="max-w-6xl mx-auto px-6 mt-20">
        
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            {loading ? 'Searching...' : search ? `Results for "${search}"` : 'Popular Courses'}
          </h2>
          <span className="text-sm text-gray-500 font-medium">{courses.length} courses found</span>
        </div>

        {courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map(c => (
              <Link 
                to={`/courses/${c._id}`} 
                key={c._id} 
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden h-full"
              >
                {/* Image Container */}
                <div className="relative h-48 overflow-hidden bg-gray-200">
                  {c.thumbnail_url ? (
                    <img 
                      src={c.thumbnail_url} 
                      alt={c.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 bg-gray-100">
                      <svg className="w-12 h-12 opacity-20" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
                    </div>
                  )}
                  {/* Price Badge */}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-gray-900 shadow-sm">
                    {c.price === 0 ? 'Free' : `₹${c.price}`}
                  </div>
                </div>
                
                {/* Card Body */}
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {c.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-grow leading-relaxed">
                    {c.description || "No description provided for this course."}
                  </p>
                  
                  <div className="pt-4 border-t border-gray-50 flex items-center justify-between mt-auto">
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      Video Course
                    </span>
                    <span className="text-sm font-medium text-gray-900 group-hover:translate-x-1 transition-transform flex items-center">
                      View Details <ArrowRightIcon />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          !loading && (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <SearchIcon />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No courses found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria.</p>
              <button 
                onClick={() => { setSearch(''); setMinPrice(''); setMaxPrice(''); fetchCourses(); }} 
                className="text-blue-600 font-semibold hover:text-blue-800 hover:underline transition"
              >
                Clear all filters
              </button>
            </div>
          )
        )}
        
        {/* Loading Skeleton */}
        {loading && (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1,2,3].map(i => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 h-80 animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-2xl"></div>
                  <div className="p-5 space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
           </div>
        )}
      </div>
    </div>
  );
}