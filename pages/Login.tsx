
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { Role } from '../types';

const Login: React.FC = () => {
  const { login } = useApp();
  const navigate = useNavigate();
  const [isSimulatingGoogle, setIsSimulatingGoogle] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showMockOptions, setShowMockOptions] = useState(false);

  const handleLogin = (role: Role) => {
    login(role);
    navigate('/');
  };

  const handleGoogleLogin = () => {
    setIsSimulatingGoogle(true);
    setTimeout(() => {
      login(Role.USER);
      navigate('/');
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto mt-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center px-4 mb-20 relative">
      {/* Privacy Modal Overlay */}
      {showPrivacy && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowPrivacy(false)}></div>
          <div className="relative glass bg-white p-10 rounded-[3rem] max-w-lg w-full shadow-2xl space-y-6 animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-black text-slate-900">Privacy & Data Security</h3>
            <div className="text-slate-600 text-sm space-y-4 leading-relaxed font-medium">
              <p>Your progress monitoring data is encrypted and stored securely. We only use your Gmail identity to synchronize your mock test results across devices.</p>
              <p>No personal data beyond your basic profile and exam performance is accessed or shared. Your learning journey is yours alone.</p>
            </div>
            <button 
              onClick={() => setShowPrivacy(false)}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
            >
              I Understand
            </button>
          </div>
        </div>
      )}

      {/* Mock Options Preview Overlay */}
      {showMockOptions && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowMockOptions(false)}></div>
          <div className="relative glass bg-white p-10 rounded-[3rem] max-w-xl w-full shadow-2xl space-y-8 animate-in slide-in-from-bottom-10 duration-500">
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">Mock Categories</h3>
              <p className="text-slate-500 font-bold">Available specialized testing modules</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 bg-blue-50 border border-blue-100 rounded-3xl">
                <div className="font-black text-blue-900">UP Police</div>
                <div className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Computer Operator</div>
              </div>
              <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-3xl">
                <div className="font-black text-emerald-900">Homeguard</div>
                <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">UP State Specialized</div>
              </div>
              <div className="p-5 bg-amber-50 border border-amber-100 rounded-3xl">
                <div className="font-black text-amber-900">Railway RRB</div>
                <div className="text-[10px] text-amber-600 font-bold uppercase tracking-widest">Group D Standard</div>
              </div>
              <div className="p-5 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-center italic text-slate-400 font-bold text-sm">
                More coming soon...
              </div>
            </div>
            <button 
              onClick={() => setShowMockOptions(false)}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}

      {/* Left Content */}
      <div className="space-y-10 animate-in slide-in-from-left-10 duration-1000">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black tracking-widest uppercase border border-blue-100">
            Real-time Progress Monitoring
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight">
            Sync Your <span className="gradient-text">Success.</span><br/>
            Analyze Your <span className="gradient-text">Growth.</span>
          </h1>
          <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-lg">
            Connect your Gmail to track every mock test, monitor subject-wise progress, and access personalized daily targets.
          </p>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => setShowMockOptions(true)}
            className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-black text-xs text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h7" /></svg>
            Mock Options Preview
          </button>
          <button 
            onClick={() => setShowPrivacy(true)}
            className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-black text-xs text-slate-600 hover:border-rose-400 hover:text-rose-600 transition-all shadow-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            Privacy Policy
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
          <div className="p-8 bg-white rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-50 space-y-4 hover:border-blue-200 transition-colors group">
            <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2" /></svg>
            </div>
            <div>
              <h4 className="font-black text-slate-800 text-lg">Detailed Analytics</h4>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">Every question you answer is mapped to your learning curve.</p>
            </div>
          </div>
          <div className="p-8 bg-white rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-50 space-y-4 hover:border-emerald-200 transition-colors group">
            <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <h4 className="font-black text-slate-800 text-lg">Exam Archiving</h4>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">Review previous attempts and revisit mistakes instantly.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Content: Login Box */}
      <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl space-y-10 animate-in zoom-in-95 duration-700 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600"></div>
        
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Portal Entry</h2>
          <p className="text-slate-500 font-bold">Secure login to your monitoring dashboard</p>
        </div>

        <div className="space-y-6">
          <button
            onClick={handleGoogleLogin}
            disabled={isSimulatingGoogle}
            className="w-full flex items-center justify-center gap-4 p-6 bg-white border-2 border-slate-100 rounded-[2.5rem] hover:bg-slate-50 hover:border-slate-200 transition-all shadow-xl shadow-slate-50 active:scale-[0.98] disabled:opacity-70 group"
          >
            {isSimulatingGoogle ? (
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-6 h-6" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
            )}
            <span className="font-black text-slate-700 text-lg">
              {isSimulatingGoogle ? 'Authenticating...' : 'Continue with Gmail'}
            </span>
          </button>

          <div className="flex items-center gap-4 px-2">
            <div className="flex-1 h-px bg-slate-100"></div>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">or access via role</span>
            <div className="flex-1 h-px bg-slate-100"></div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={() => handleLogin(Role.USER)}
              className="w-full flex items-center justify-between p-7 bg-slate-900 text-white rounded-[2rem] hover:bg-black transition-all shadow-xl group hover:-translate-y-1"
            >
              <div className="text-left">
                <div className="font-black text-xl tracking-tight leading-none mb-1">Student Entry</div>
                <div className="text-slate-400 font-bold text-xs">Full Syllabus Monitoring</div>
              </div>
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </button>

            <button
              onClick={() => handleLogin(Role.ADMIN)}
              className="w-full flex items-center justify-between p-7 bg-white border-2 border-slate-100 text-slate-900 rounded-[2rem] hover:border-slate-200 transition-all group hover:-translate-y-1"
            >
              <div className="text-left">
                <div className="font-black text-xl tracking-tight leading-none mb-1">Admin Entry</div>
                <div className="text-slate-400 font-bold text-xs">Question Bank Control</div>
              </div>
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </button>
          </div>
        </div>

        <div className="pt-8 text-center text-xs text-slate-400 space-y-6 border-t border-slate-50">
          <p className="font-medium italic">Secure cloud syncing enabled for all Gmail accounts.</p>
          <div className="flex justify-center gap-4">
            <span className="bg-slate-50 px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest border border-slate-100 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => setShowPrivacy(true)}>Data Policy</span>
            <span className="bg-slate-50 px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest border border-slate-100">OAuth 2.0</span>
            <span className="bg-slate-50 px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest border border-slate-100">SSL Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
