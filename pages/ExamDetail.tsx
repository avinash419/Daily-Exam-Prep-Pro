
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../store';

const ExamDetail: React.FC = () => {
  const { examId } = useParams();
  const { exams, subjects, toggleTopic } = useApp();
  const navigate = useNavigate();

  const exam = exams.find(e => e.id === examId);
  if (!exam) return <div className="p-20 text-center font-black text-slate-400">Target Exam Not Found</div>;

  const examSubjects = subjects.filter(s => exam.subjects.includes(s.id));

  const getProgressStyles = (progress: number) => {
    if (progress <= 30) return { color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', bar: 'bg-rose-500' };
    if (progress <= 70) return { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', bar: 'bg-amber-500' };
    return { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', bar: 'bg-emerald-500' };
  };

  return (
    <div className="max-w-7xl mx-auto space-y-16 animate-in fade-in duration-700 pb-32">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
        <div className="flex items-center gap-8">
          <button
            onClick={() => navigate('/')}
            className="w-14 h-14 glass rounded-3xl flex items-center justify-center text-slate-900 hover:bg-slate-900 hover:text-white transition-all duration-300 shadow-xl"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="space-y-1">
             <div className="flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-blue-500"></span>
               <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Syllabus Master</span>
             </div>
             <h1 className="text-5xl font-black text-slate-900 tracking-tight">{exam.name}</h1>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
           <div className="glass px-8 py-5 rounded-[2rem] border-slate-200/50 shadow-sm flex flex-col justify-center">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Core Modules</div>
              <div className="text-2xl font-black text-slate-900 leading-none">{examSubjects.length}</div>
           </div>
           <div className="glass px-8 py-5 rounded-[2rem] border-slate-200/50 shadow-sm flex flex-col justify-center">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Overall Ready</div>
              <div className="text-2xl font-black text-blue-600 leading-none">
                {Math.round(examSubjects.reduce((a, b) => a + b.progress, 0) / examSubjects.length)}%
              </div>
           </div>
        </div>
      </div>

      {/* Subjects & Chapters Section */}
      <div className="space-y-24">
        {examSubjects.map((subject, sIdx) => {
          const styles = getProgressStyles(subject.progress);
          const completedCount = subject.topics.filter(t => t.completed).length;
          
          return (
            <div key={subject.id} className="relative group animate-in slide-in-from-bottom-12 duration-1000" style={{ animationDelay: `${sIdx * 150}ms` }}>
              {/* Subject Title & Stats */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10 px-4">
                <div className="space-y-4 max-w-2xl">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black ${styles.bg} ${styles.color}`}>
                       {sIdx + 1}
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">{subject.name}</h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${styles.color} ${styles.bg} border ${styles.border}`}>
                      {subject.progress}% Content Mastered
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-100 px-4 py-2 rounded-2xl">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.082.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                      {completedCount} of {subject.topics.length} Chapters Complete
                    </div>
                  </div>
                </div>

                <Link
                  to={`/exam/${examId}/subject/${subject.id}`}
                  className="group px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-sm flex items-center gap-3 hover:bg-blue-600 transition-all duration-300 shadow-2xl shadow-slate-200"
                >
                  Attempt Full Subject Mock
                  <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>

              {/* Subject Progress Bar */}
              <div className="px-4 mb-10">
                <div className="w-full bg-slate-100 rounded-full h-4 p-1 shadow-inner overflow-hidden">
                  <div
                    className={`${styles.bar} h-full rounded-full transition-all duration-1000 shadow-lg`}
                    style={{ width: `${subject.progress}%` }}
                  />
                </div>
              </div>

              {/* Chapters Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-2">
                {subject.topics.map((topic, tIdx) => (
                  <button
                    key={topic.name}
                    onClick={() => toggleTopic(subject.id, topic.name)}
                    className={`group relative text-left p-6 rounded-[2rem] border-2 transition-all duration-300 card-hover ${
                      topic.completed 
                      ? 'bg-emerald-50/40 border-emerald-100 shadow-sm' 
                      : 'bg-white border-slate-100 hover:border-blue-200'
                    }`}
                  >
                    <div className="flex flex-col gap-5 h-full">
                      <div className="flex justify-between items-start">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm transition-all duration-500 ${
                          topic.completed 
                          ? 'bg-emerald-500 text-white rotate-[360deg]' 
                          : 'bg-slate-100 text-slate-400 group-hover:bg-blue-600 group-hover:text-white'
                        }`}>
                          {topic.completed ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                          ) : (
                            <span>{String(tIdx + 1).padStart(2, '0')}</span>
                          )}
                        </div>
                        {topic.completed && (
                          <div className="text-[8px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-100 px-2 py-1 rounded-lg">Mastered</div>
                        )}
                      </div>
                      <span className={`text-base font-bold leading-snug tracking-tight ${topic.completed ? 'text-slate-400 line-through decoration-emerald-300 decoration-2' : 'text-slate-800'}`}>
                        {topic.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              
              {sIdx < examSubjects.length - 1 && (
                <div className="mt-20 pt-10 border-t border-slate-100/50 flex justify-center">
                   <div className="w-2 h-2 rounded-full bg-slate-200 mx-1"></div>
                   <div className="w-2 h-2 rounded-full bg-slate-200 mx-1"></div>
                   <div className="w-2 h-2 rounded-full bg-slate-200 mx-1"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExamDetail;
