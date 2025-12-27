
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
    // Fix: Using Difficulty.HARD instead of non-existent EXAM_LEVEL
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
      // Fix: Using Difficulty.HARD instead of non-existent EXAM_LEVEL
      case Difficulty.HARD: return 'bg-red-100 text-red-700';
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/exam/${examId}`)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{subject.name} Mocks</h1>
            <p className="text-gray-500">Generated for {exam.name} pattern</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
           <span className="text-sm font-bold text-blue-700">{completedMocks.filter(m => m.startsWith(subjectId)).length} / 20 Mocks Cleared</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {mocks.map((mock) => (
          <button
            key={mock.id}
            onClick={() => navigate(`/mock/${mock.id}?subject=${subject.name}`)}
            className={`group text-left bg-white rounded-2xl border ${mock.isCompleted ? 'border-blue-200 ring-2 ring-blue-50' : 'border-gray-200'} p-6 hover:shadow-xl transition-all relative overflow-hidden`}
          >
            {mock.isCompleted && (
              <div className="absolute top-0 right-0 p-2 bg-blue-600 rounded-bl-xl shadow-lg">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-2xl font-black text-gray-200 group-hover:text-blue-100 transition">#{mock.num}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${getDifficultyColor(mock.difficulty)}`}>
                  {mock.difficulty}
                </span>
              </div>
              
              <div>
                <h4 className="font-bold text-gray-900">Mock Test {mock.num}</h4>
                <p className="text-xs text-gray-500 mt-1">10 Questions • 15 Mins</p>
              </div>

              {mock.isCompleted ? (
                <div className="pt-2 border-t border-gray-50">
                  <div className="text-[10px] font-bold text-gray-400 uppercase">Best Score</div>
                  <div className="text-lg font-black text-blue-600">{mock.bestScore}%</div>
                </div>
              ) : (
                <div className="pt-4 flex items-center gap-2 text-sm font-bold text-blue-600">
                  Take Test
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MockList;
