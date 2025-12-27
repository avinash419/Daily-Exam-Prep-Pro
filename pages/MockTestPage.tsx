
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../store';
import { Question, Difficulty, Language } from '../types';

const TRANSLATIONS = {
  [Language.ENGLISH]: {
    progress: "Progress",
    of: "of",
    items: "Items",
    timeLeft: "Time Left",
    previous: "Previous",
    next: "Next Step",
    submit: "Submit Mock",
    exit: "Exit",
    quitMsg: "Quit the test? Progress will be lost.",
    navCenter: "Nav Center",
    answered: "Answered",
    pending: "Pending",
    forceSubmit: "Force Submit",
    finishedTitle: "Success! Test Analyzed.",
    finishedSub: "Your performance metrics are ready for review.",
    scoreLabel: "Raw Score",
    accuracyLabel: "Accuracy",
    backBtn: "Back to Dashboard",
    reviewBtn: "Review Explanations",
    performanceReview: "Performance Review",
    explanationLabel: "Logic & Explanation"
  },
  [Language.HINDI]: {
    progress: "प्रगति",
    of: "में से",
    items: "प्रश्न",
    timeLeft: "समय शेष",
    previous: "पिछला",
    next: "अगला कदम",
    submit: "सबमिट करें",
    exit: "बाहर निकलें",
    quitMsg: "क्या आप टेस्ट छोड़ना चाहते हैं?",
    navCenter: "नेविगेशन केंद्र",
    answered: "उत्तर दिया",
    pending: "लंबित",
    forceSubmit: "जबरन सबमिट",
    finishedTitle: "सफलता! विश्लेषण तैयार।",
    finishedSub: "आपका प्रदर्शन रिपोर्ट तैयार है।",
    scoreLabel: "कुल स्कोर",
    accuracyLabel: "सटीकता",
    backBtn: "डैशबोर्ड पर वापस",
    reviewBtn: "स्पष्टीकरण देखें",
    performanceReview: "प्रदर्शन समीक्षा",
    explanationLabel: "तर्क और स्पष्टीकरण"
  },
  [Language.BHOJPURI_ENGLISH]: {
    progress: "Progress (कोगो भइल)",
    of: "/",
    items: "सवाल",
    timeLeft: "टाइम बचल बा",
    previous: "पिछला वाला",
    next: "अगला वाला",
    submit: "जमा करीं",
    exit: "बाहर निकलीं",
    quitMsg: "टेस्ट छोड़ के जाइल चाहतानी का?",
    navCenter: "Nav Center (लिस्ट)",
    answered: "टिक भइल",
    pending: "बाकी बा",
    forceSubmit: "जबरदस्ती जमा करीं",
    finishedTitle: "शाबाश! रिजल्ट आ गइल।",
    finishedSub: "अपन रिपोर्ट देखीं कइसन कइल बानी।",
    scoreLabel: "नंबर",
    accuracyLabel: "एकदम सही (%)",
    backBtn: "Dashboard देखीं",
    reviewBtn: "स्पष्टीकरण देखीं",
    performanceReview: "सब सवाल देखीं",
    explanationLabel: "काहे ई आंसर बा (Logic)"
  }
};

const MockTestPage: React.FC = () => {
  const { mockId } = useParams();
  const [searchParams] = useSearchParams();
  const subjectName = searchParams.get('subject') || '';
  const { questions, addMockResult, language } = useApp();
  const navigate = useNavigate();

  const t = TRANSLATIONS[language];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({});
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 mins
  const [isFinished, setIsFinished] = useState(false);
  const [testQuestions, setTestQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const mockParts = mockId?.split('-') || [];
    const mockNumStr = mockParts[mockParts.length - 1];
    const mockNum = parseInt(mockNumStr) || 1;
    
    let diff: Difficulty = Difficulty.EASY;
    if (mockNum >= 6 && mockNum <= 15) diff = Difficulty.MEDIUM;
    if (mockNum >= 16) diff = Difficulty.HARD;

    const filtered = questions.filter(q => 
      (q.subject.toLowerCase() === subjectName.toLowerCase() || q.subject === subjectName) && 
      q.difficulty === diff
    ).slice(0, 10);
    
    setTestQuestions(filtered);
    setIsLoading(false);
  }, [mockId, questions, subjectName]);

  useEffect(() => {
    if (timeLeft <= 0 && !isFinished && testQuestions.length > 0) {
      handleFinish();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isFinished, testQuestions]);

  const handleFinish = () => {
    setIsFinished(true);
    let score = 0;
    testQuestions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswer) score++;
    });
    const percentage = Math.round((score / testQuestions.length) * 100);
    addMockResult(mockId!, percentage);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Curating Question Set...</p>
      </div>
    );
  }

  if (testQuestions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto mt-20 p-12 bg-white rounded-[3rem] border border-slate-200 shadow-2xl text-center space-y-8">
        <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h2 className="text-3xl font-black text-slate-900">No Questions Found</h2>
        <p className="text-slate-500 font-medium">Add questions via the Admin Panel to proceed.</p>
        <button onClick={() => navigate(-1)} className="px-10 py-4 bg-slate-900 text-white rounded-[2rem] font-black hover:bg-black transition shadow-xl">Go Back</button>
      </div>
    );
  }

  if (isFinished) {
    const score = testQuestions.reduce((acc, q, idx) => userAnswers[idx] === q.correctAnswer ? acc + 1 : acc, 0);
    const percentage = Math.round((score/testQuestions.length)*100);
    
    return (
      <div className="max-w-4xl mx-auto space-y-12 animate-in zoom-in-95 duration-700 pb-20">
        <div className="bg-white rounded-[3rem] p-12 border border-slate-200 shadow-2xl text-center space-y-8 overflow-hidden relative">
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-emerald-400 to-blue-500"></div>
          
          <div className="space-y-2">
            <h2 className="text-5xl font-black text-slate-900 tracking-tight">{t.finishedTitle}</h2>
            <p className="text-slate-500 font-medium">{t.finishedSub}</p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-10 py-6">
            <div className="space-y-2">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.scoreLabel}</div>
              <div className="text-6xl font-black text-slate-900">{score}<span className="text-2xl text-slate-300">/</span>{testQuestions.length}</div>
            </div>
            <div className="space-y-2">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.accuracyLabel}</div>
              <div className="text-6xl font-black text-blue-600">{percentage}%</div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate(-1)} className="px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black shadow-xl hover:bg-black transition-all">{t.backBtn}</button>
            <button onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })} className="px-10 py-5 glass border-slate-200 text-slate-900 rounded-[2rem] font-black shadow-lg">{t.reviewBtn}</button>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-3xl font-black text-slate-900 tracking-tight px-4">{t.performanceReview}</h3>
          {testQuestions.map((q, idx) => {
            const isCorrect = userAnswers[idx] === q.correctAnswer;
            return (
              <div key={idx} className={`p-8 bg-white rounded-[2.5rem] border-2 transition-all ${isCorrect ? 'border-emerald-100 bg-emerald-50/20' : 'border-rose-100 bg-rose-50/20'}`}>
                <div className="flex gap-6">
                  <span className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                    {idx + 1}
                  </span>
                  <div className="space-y-6 flex-1">
                    <p className="text-xl font-bold text-slate-800 leading-snug">{q.questionText}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Object.entries(q.options).map(([key, val]) => (
                        <div key={key} className={`p-4 rounded-2xl border-2 flex items-center gap-4 ${key === q.correctAnswer ? 'bg-emerald-100 border-emerald-300 font-black text-emerald-900' : (key === userAnswers[idx] ? 'bg-rose-100 border-rose-300 font-black text-rose-900' : 'bg-white border-slate-100 text-slate-500')}`}>
                          <span className="w-8 h-8 rounded-xl bg-white/50 flex items-center justify-center text-xs">{key}</span>
                          <span className="text-sm">{val}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 p-6 glass bg-blue-50/50 border-blue-100 rounded-3xl">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{t.explanationLabel}</span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed font-medium">{q.explanation}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const currentQuestion = testQuestions[currentIdx];

  return (
    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-10 pb-32 animate-in fade-in duration-700">
      <div className="flex-1 space-y-8">
        <div className="flex items-center justify-between glass border-white/80 p-5 rounded-[2.5rem] sticky top-20 z-10 shadow-xl">
           <div className="flex items-center gap-5">
             <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xl shadow-lg">
               {currentIdx + 1}
             </div>
             <div>
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.progress}</div>
               <div className="text-sm font-black text-slate-900">{currentIdx + 1} {t.of} {testQuestions.length} {t.items}</div>
             </div>
           </div>
           
           <div className={`px-8 py-4 rounded-[2rem] font-mono font-black text-xl flex items-center gap-3 transition-colors ${timeLeft < 120 ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-blue-50 text-blue-700'}`}>
              <span className="hidden sm:inline text-xs uppercase mr-2">{t.timeLeft}</span>
              {formatTime(timeLeft)}
           </div>
        </div>

        <div className="glass bg-white/80 rounded-[3rem] p-10 md:p-14 border-white/50 shadow-2xl space-y-12">
          <p className="text-3xl font-black text-slate-900 leading-[1.2] tracking-tight">{currentQuestion.questionText}</p>
          <div className="grid grid-cols-1 gap-5">
            {Object.entries(currentQuestion.options).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setUserAnswers(prev => ({ ...prev, [currentIdx]: key as any }))}
                className={`group p-7 rounded-[2.5rem] border-2 text-left transition-all flex items-center gap-6 ${userAnswers[currentIdx] === key ? 'border-blue-600 bg-blue-50 shadow-lg' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}
              >
                <span className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${userAnswers[currentIdx] === key ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{key}</span>
                <span className={`flex-1 text-lg font-bold ${userAnswers[currentIdx] === key ? 'text-blue-900' : 'text-slate-600'}`}>{val}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 bg-slate-100/50 p-4 rounded-[3rem]">
          <button disabled={currentIdx === 0} onClick={() => setCurrentIdx(prev => prev - 1)} className="w-full sm:w-auto px-10 py-5 rounded-[2rem] font-black text-slate-500 disabled:opacity-30">{t.previous}</button>
          <div className="flex gap-4 w-full sm:w-auto">
             <button onClick={() => {if(confirm(t.quitMsg)) navigate(-1)}} className="px-8 py-5 text-rose-500 font-black text-sm uppercase tracking-widest">{t.exit}</button>
            {currentIdx < testQuestions.length - 1 ? (
              <button onClick={() => setCurrentIdx(prev => prev + 1)} className="flex-1 sm:flex-none px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black shadow-xl">{t.next}</button>
            ) : (
              <button onClick={handleFinish} className="flex-1 sm:flex-none px-12 py-5 bg-emerald-600 text-white rounded-[2rem] font-black shadow-xl">{t.submit}</button>
            )}
          </div>
        </div>
      </div>

      <aside className="w-full lg:w-80 space-y-8">
        <div className="glass bg-white/60 rounded-[3rem] p-8 border-white/50 shadow-xl sticky top-40">
          <h4 className="text-sm font-black text-slate-900 mb-8 uppercase tracking-[0.2em]">{t.navCenter}</h4>
          <div className="grid grid-cols-5 gap-3">
            {testQuestions.map((_, idx) => (
              <button key={idx} onClick={() => setCurrentIdx(idx)} className={`w-11 h-11 rounded-2xl font-black text-sm flex items-center justify-center transition-all ${currentIdx === idx ? 'ring-4 ring-blue-500/20' : ''} ${userAnswers[idx] ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border-2 border-slate-100 text-slate-400'}`}>{idx + 1}</button>
            ))}
          </div>
          <div className="mt-12 space-y-4">
             <div className="flex items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
               <div className="w-4 h-4 rounded-lg bg-blue-600"></div> {t.answered}
             </div>
             <div className="flex items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
               <div className="w-4 h-4 rounded-lg bg-white border-2 border-slate-100"></div> {t.pending}
             </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-100">
             <button onClick={handleFinish} className="w-full py-5 bg-emerald-50 text-emerald-600 rounded-[2rem] text-xs font-black uppercase tracking-widest border border-emerald-100">{t.forceSubmit}</button>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default MockTestPage;
