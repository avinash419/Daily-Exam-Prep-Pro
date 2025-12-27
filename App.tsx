
import React from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { AppProvider, useApp } from './store';
import { Role, Language } from './types';
import Dashboard from './pages/Dashboard';
import ExamDetail from './pages/ExamDetail';
import MockList from './pages/MockList';
import MockTestPage from './pages/MockTestPage';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';

const ProtectedRoute: React.FC<{ children: React.ReactNode, role?: Role }> = ({ children, role }) => {
  const { user } = useApp();
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return <>{children}</>;
};

const Navbar: React.FC = () => {
  const { user, logout, language, setLanguage } = useApp();
  const navigate = useNavigate();

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <Link to="/" className="text-xl font-bold text-blue-600 flex items-center gap-2">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.382 0z" />
          </svg>
          <span className="hidden sm:inline">ExamPrep Pro</span>
        </Link>
        {user && (
          <div className="hidden lg:flex gap-6">
            <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium">Dashboard</Link>
            {user.role === Role.ADMIN && (
              <Link to="/admin" className="text-gray-600 hover:text-blue-600 font-medium">Admin Panel</Link>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="text-xs font-black bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none cursor-pointer focus:ring-2 ring-blue-100"
          >
            <option value={Language.ENGLISH}>English</option>
            <option value={Language.HINDI}>हिन्दी</option>
            <option value={Language.BHOJPURI_ENGLISH}>Bhojpuri-English</option>
          </select>
        )}
        
        {user ? (
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
              {user.username}
            </span>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="text-sm font-semibold text-red-600 hover:text-red-700"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <Link to="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1 container mx-auto px-4 py-8">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/exam/:examId" element={<ProtectedRoute><ExamDetail /></ProtectedRoute>} />
              <Route path="/exam/:examId/subject/:subjectId" element={<ProtectedRoute><MockList /></ProtectedRoute>} />
              <Route path="/mock/:mockId" element={<ProtectedRoute><MockTestPage /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute role={Role.ADMIN}><AdminPanel /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <footer className="bg-gray-50 border-t border-gray-200 py-6 text-center text-gray-500 text-sm">
            &copy; 2024 Daily Exam Prep Pro. All rights reserved.
          </footer>
        </div>
      </HashRouter>
    </AppProvider>
  );
};

export default App;
