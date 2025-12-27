
import React, { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../store';
import { Exam, Subject, Language } from '../types';

const BHOJPURI_SHAYARIS = [
  "हिम्मत मत हारिहऽ, मेहनत रंग लाई, एक दिन ई दुनिया तोहार नाम गाई।",
  "लक्ष्य के पीछा अईसन करऽ कि सफलता तोहार दासी बन जाई।",
  "जब मन में जीत के ठान लिहला तऽ हार के कवनो गुंजाइश नईखे।",
  "मेहनत अईसन करऽ कि किस्मत भी कहे, 'ले बाबू ई तऽ तोहरे हक हऽ'!",
  "सपना ओकरा के ना कहेलन जे नींद में आवेला, सपना ओकरा के कहेलन जे रउआ के सूते ना दे।",
  "जे पसीना से नहायेला उहे इतिहास रचेला, पानी से नहाये वाला तऽ खाली लिबास बदलेलन।",
  "काठ के हांडी बार-बार ना चढ़ेला, मेहनत के फल कखनो फीका ना पड़ेला।",
  "समय के पहिया घूमत रही, बस रउआ अपना रफ़्तार बनईले राखीं।"
];

const TRANSLATIONS = {
  [Language.ENGLISH]: {
    dashboard: "Dashboard",
    subtext: "Your progress is synced across all targets.",
    briefingBtn: "Show Daily Briefing",
    heroHeading: "Master Your Dream Career",
    heroSub: "One platform. Unified syllabus. Triple the success rate.",
    launchBtn: "Launch Dashboard",
    mission: "Today's Mission",
    target: "Target Objective",
    continue: "Continue Prep",
    systemSynced: "System Synced",
    motivationLabel: "TODAY'S MOTIVATION",
    letGoBtn: "Let's Go!",
    refreshMotivation: "Refresh Motivation & Target"
  },
  [Language.HINDI]: {
    dashboard: "डैशबोर्ड",
    subtext: "आपकी प्रगति सभी लक्ष्यों में सिंक है।",
    briefingBtn: "दैनिक ब्रीफिंग देखें",
    heroHeading: "अपने सपनों का करियर हासिल करें",
    heroSub: "एक मंच। एकीकृत पाठ्यक्रम। सफलता की तिगुनी दर।",
    launchBtn: "डैशबोर्ड शुरू करें",
    mission: "आज का मिशन",
    target: "लक्ष्य का उद्देश्य",
    continue: "तैयारी जारी रखें",
    systemSynced: "सिस्टम सिंक है",
    motivationLabel: "आज का मोटिवेशन",
    letGoBtn: "चलिए शुरू करते हैं!",
    refreshMotivation: "मोटिवेशन और लक्ष्य बदलें"
  },
  [Language.BHOJPURI_ENGLISH]: {
    dashboard: "Dashboard (खाता-बही)",
    subtext: "सब प्रोग्रेस एकदम अपडेट बाटे।",
    briefingBtn: "आज के हाल-चाल देखीं",
    heroHeading: "सपना वाला नौकरी पाईं",
    heroSub: "एगो पोर्टल, सब सिलबस। अबकी बार पक्का सफलता।",
    launchBtn: "डैशबोर्ड खोलीं",
    mission: "आज के मिशन",
    target: "मेन टारगेट",
    continue: "तैयारी चालू रखीं",
    systemSynced: "सब सिंक बा",
    motivationLabel: "आज के मोटिवेशन",
    letGoBtn: "चलीं शुरू कइल जाव!",
    refreshMotivation: "नया मोटिवेशन देखीं"
  }
};

const Dashboard: React.FC = () => {
  const { exams, subjects, user, language } = useApp();
  const [started, setStarted] = useState(false);
  const [showingBriefing, setShowingBriefing] = useState(false);
  const [currentShayari, setCurrentShayari] = useState("");
  const [currentTarget, setCurrentTarget] = useState({ subject: "", topic: "" });

  const t = TRANSLATIONS[language];

  const generateDailyBriefing = useCallback(() => {
    const randomShayari = BHOJPURI_SHAYARIS[Math.floor(Math.random() * BHOJPURI_SHAYARIS.length)];
    setCurrentShayari(randomShayari);

    const allIncomplete = subjects.flatMap(sub => 
      sub.topics.filter(t => !t.completed).map(t => ({ subject: sub.name, topic: t.name }))
    );

    if (allIncomplete.length > 0) {
      const randomTarget = allIncomplete[Math.floor(Math.random() * allIncomplete.length)];
      setCurrentTarget(randomTarget);
    } else {
      setCurrentTarget({ subject: "Revision", topic: "All Mastered! Take a Full Mock." });
    }
  }, [subjects]);

  const handleLaunch = () => {
    generateDailyBriefing();
    setShowingBriefing(true);
  };

  const getProgressColor = (progress: number) => {
    if (progress <= 30) return 'from-rose-500 to-red-600';
    if (progress <= 70) return 'from-amber-400 to-orange-500';
    return 'from-emerald-400 to-teal-600';
  };

  const getProgressLabel = (progress: number) => {
    if (progress <= 30) return language === Language.ENGLISH ? 'Needs Effort' : language === Language.HINDI ? 'और मेहनत चाहिए' : 'मेहनत करीं';
    if (progress <= 70) return language === Language.ENGLISH ? 'Steady Progress' : language === Language.HINDI ? 'स्थिर प्रगति' : 'ठीक-ठाक चलत बा';
    return language === Language.ENGLISH ? 'Ready to Crack' : language === Language.HINDI ? 'तैयार हैं' : 'एकदम तैयार';
  };

  if (!started && !showingBriefing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] text-center px-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-400/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-400/10 rounded-full blur-[100px] animate-pulse delay-1000"></div>

        <div className="max-w-4xl space-y-8 animate-in fade-in zoom-in duration-1000">
          <div className="inline-flex items-center gap-2 px-5 py-2 glass border-blue-100 text-blue-600 rounded-full text-xs font-black tracking-widest mb-4 uppercase animate-bounce">
            Live Prep Portal
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 leading-[1.1] tracking-tight">
            {t.heroHeading.split('Master')[0]} <br/>
            <span className="gradient-text">{t.heroHeading}</span>
          </h1>
          
          <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
            {t.heroSub}
          </p>

          <div className="pt-10 flex flex-col sm:flex-row items-center justify-center gap-6">
            <button
              onClick={handleLaunch}
              className="group relative px-12 py-6 bg-slate-900 text-white text-2xl font-black rounded-[2rem] shadow-2xl hover:bg-slate-800 transition-all duration-300 hover:-translate-y-2 overflow-hidden w-full sm:w-auto"
            >
              <span className="relative z-10">{t.launchBtn}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showingBriefing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-in fade-in zoom-in-95 duration-700">
        <div className="max-w-3xl w-full glass bg-white/80 border-blue-100 p-10 md:p-14 rounded-[3rem] shadow-2xl relative overflow-hidden">
          <div className="relative z-10 space-y-12">
            <div className="space-y-6 text-center">
              <div className="inline-block px-4 py-1.5 bg-orange-100 text-orange-700 rounded-full text-[10px] font-black tracking-[0.2em] uppercase">
                {t.motivationLabel}
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight italic">
                "{currentShayari}"
              </h2>
            </div>

            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-6 shadow-xl shadow-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.mission}</span>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-[10px] font-black uppercase">High Priority</span>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm font-medium text-slate-400">{currentTarget.subject}</div>
                <div className="text-2xl md:text-3xl font-black text-white">{currentTarget.topic}</div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button
                onClick={() => {
                  setShowingBriefing(false);
                  setStarted(true);
                }}
                className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-lg shadow-2xl hover:bg-black transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
              >
                {t.letGoBtn}
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <button 
                onClick={generateDailyBriefing}
                className="text-xs font-black text-slate-400 hover:text-slate-600 transition uppercase tracking-widest"
              >
                {t.refreshMotivation}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in slide-in-from-bottom-10 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-10">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">{t.dashboard}</h2>
          <p className="text-slate-500 font-medium text-lg">{t.subtext}</p>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => { setStarted(false); setShowingBriefing(false); }}
            className="text-xs font-black text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 transition"
          >
            {t.briefingBtn}
          </button>
          <div className="bg-emerald-50 text-emerald-700 px-6 py-3 rounded-2xl border border-emerald-100 text-sm font-bold flex items-center gap-3">
            {t.systemSynced}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {exams.map((exam, idx) => {
          const examSubjects = subjects.filter(s => exam.subjects.includes(s.id));
          const avgProgress = Math.round(examSubjects.reduce((acc, curr) => acc + curr.progress, 0) / examSubjects.length);

          return (
            <Link
              key={exam.id}
              to={`/exam/${exam.id}`}
              className="group glass relative p-8 rounded-[2.5rem] border-white/50 shadow-xl card-hover overflow-hidden animate-in slide-in-from-bottom-6 duration-700"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex justify-between items-start mb-10">
                <div className="space-y-1.5">
                  <h3 className="text-3xl font-black text-slate-900 leading-none">{exam.name}</h3>
                </div>
                <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center text-white bg-gradient-to-br ${getProgressColor(avgProgress)} shadow-xl shadow-blue-200/50`}>
                  <span className="text-lg font-black leading-none">{avgProgress}%</span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="text-sm font-black text-slate-800 tracking-tight">{getProgressLabel(avgProgress)}</div>
                <div className="relative w-full h-4 bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner">
                  <div
                    className={`absolute inset-y-1 left-1 bg-gradient-to-r ${getProgressColor(avgProgress)} rounded-full transition-all duration-1000 ease-out shadow-lg`}
                    style={{ width: `calc(${avgProgress}% - 8px)` }}
                  />
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-slate-100/50 flex items-center justify-between group-hover:translate-x-1 transition-transform">
                <span className="text-sm font-black text-slate-900 uppercase tracking-widest">{t.continue}</span>
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
