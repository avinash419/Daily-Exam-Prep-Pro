
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { Role } from '../types';

const Login: React.FC = () => {
  const { login } = useApp();
  const navigate = useNavigate();

  const handleLogin = (role: Role) => {
    login(role);
    navigate('/');
  };

  return (
    <div className="max-w-md mx-auto mt-20 space-y-8 p-10 bg-white rounded-3xl border border-gray-200 shadow-2xl animate-in zoom-in-95 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-gray-900">Welcome Back</h2>
        <p className="text-gray-500">Select your role to continue prep</p>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => handleLogin(Role.USER)}
          className="w-full flex items-center justify-between p-6 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition shadow-xl shadow-blue-200 group"
        >
          <div className="text-left">
            <div className="font-black text-xl">I am a Student</div>
            <div className="text-blue-100 text-sm">Attempt mocks & track progress</div>
          </div>
          <svg className="w-8 h-8 opacity-50 group-hover:translate-x-1 group-hover:opacity-100 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>

        <button
          onClick={() => handleLogin(Role.ADMIN)}
          className="w-full flex items-center justify-between p-6 bg-gray-900 text-white rounded-2xl hover:bg-black transition group shadow-xl"
        >
          <div className="text-left">
            <div className="font-black text-xl">I am Admin</div>
            <div className="text-gray-400 text-sm">Manage question bank & syllabus</div>
          </div>
          <svg className="w-8 h-8 opacity-50 group-hover:translate-x-1 group-hover:opacity-100 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>

      <div className="pt-8 text-center text-xs text-gray-400 space-y-4 border-t border-gray-100">
        <p>By logging in, you agree to our Terms and Conditions.</p>
        <div className="flex justify-center gap-4">
          <span className="bg-gray-100 px-2 py-1 rounded">Secure JWT Auth</span>
          <span className="bg-gray-100 px-2 py-1 rounded">Daily Progress Tracking</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
