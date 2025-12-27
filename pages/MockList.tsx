
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { Difficulty } from '../types';

const MockList: React.FC = () => {
  const { examId, subjectId } = useParams();
  const { exams, subjects, completedMocks, bestScores } = useApp();
  const navigate = useNavigate();

  const exam = exams.find(e => e.id === examId);
  const subject = subjects.find(s => s.id === subjectId);

  if (!exam || !subject) return <div>Data missing</div>;

  const mocks = Array.from({ length: 20 }, (_, i) => {
    const mockNum = i + 1;
    let difficulty = Difficulty.EASY;
    if (mockNum >= 6 && mockNum <= 15) difficulty = Difficulty.MEDIUM;
    if (mockNum >= 16) difficulty = Difficulty.HARD;
    
    const mockId = `${subjectId}-mock-${mockNum}`;
    const isCompleted = completedMocks.includes(mockId);
    const bestScore = bestScores[mockId];

    return { id: mockId, num: mockNum, difficulty, isCompleted, bestScore };
  });

  const getDifficultyColor = (diff: Difficulty) => {
    switch (diff) {
      case Difficulty.EASY: return 'bg-green-100 text-green-700';
      case Difficulty.MEDIUM: return 'bg-orange-100 text-orange-700';
      case Difficulty.HARD: return 'bg-red-100 text-red-700';
    }
  };

  return (
    <div className="space-y-12 animate-in slide-in-from-right-4 duration-500 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-white p-10 rounded-[3rem] shadow-xl border border-slate-50">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate(`/exam/${examId}`)}
            className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{subject.name}</h1>
            <p className="text-slate-500 font-bold">Standardized mock series for {exam.name} pattern</p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-blue-50 px-8 py-5 rounded-[2rem] border border-blue-100 shadow-lg shadow-blue-50">
           <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black">
             {completedMocks.filter(m => m.startsWith(subjectId)).length}
           </div>
           <div className="text-sm font-black text-blue-800 uppercase tracking-widest leading-none">Mocks<br/>Attempted</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {mocks.map((mock) => (
          <div
            key={mock.id}
            className={`group bg-white rounded-[2.5rem] border-2 flex flex-col h-full transition-all duration-300 shadow-xl hover:shadow-2xl overflow-hidden ${mock.isCompleted ? 'border-blue-100 ring-4 ring-blue-50/50' : 'border-slate-50 hover:border-slate-100'}`}
          >
            <div className="p-8 space-y-6 flex-1">
              <div className="flex justify-between items-start">
                <span className={`text-3xl font-black transition-colors ${mock.isCompleted ? 'text-blue-100' : 'text-slate-100'}`}>#{mock.num}</span>
                <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${getDifficultyColor(mock.difficulty)}`}>
                  {mock.difficulty}
                </span>
              </div>
              
              <div className="space-y-1">
                <h4 className="text-xl font-black text-slate-900 tracking-tight">Mock Test {mock.num}</h4>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  10 Items • 15 Mins
                </div>
              </div>

              {mock.isCompleted && (
                <div className="pt-6 border-t border-slate-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mastery Level</span>
                    <span className="text-lg font-black text-blue-600">{mock.bestScore}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${mock.bestScore}%` }}></div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-4 pb-4">
              {mock.isCompleted ? (
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => navigate(`/mock/${mock.id}?subject=${subject.name}`)}
                    className="py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-black transition-all"
                  >
                    Retake
                  </button>
                  <button 
                    onClick={() => navigate(`/mock/${mock.id}?subject=${subject.name}`)}
                    className="py-4 bg-blue-50 text-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-blue-100 hover:bg-blue-100 transition-all"
                  >
                    Review
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate(`/mock/${mock.id}?subject=${subject.name}`)}
                  className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl group-hover:bg-blue-600 transition-all flex items-center justify-center gap-3"
                >
                  Start Mock
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MockList;
