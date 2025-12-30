import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Page Imports
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Dashboard from "./pages/Dashboard";
import CoursePage from "./pages/CoursePage";
import InstructorDashboard from "./pages/InstructorDashboard";

// --- THESE WERE MISSING ---
import CourseResources from "./pages/CourseResources";
import CourseQuizzes from "./pages/CourseQuizzes";
// --------------------------

import Header from "./components/Header";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-slate-50">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Course Tab Routes */}
            <Route path="/courses/:id" element={<CoursePage />} />
            <Route path="/courses/:id/resources" element={<CourseResources />} />
            <Route path="/courses/:id/quizzes" element={<CourseQuizzes />} />
            
            <Route path="/instructor" element={<InstructorDashboard />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}