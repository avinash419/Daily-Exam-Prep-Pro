
import React, { useState, useRef } from 'react';
import { useApp } from '../store';
import { Difficulty, Question } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

interface IngestionSummary {
  totalDetected: number;
  accepted: number;
  rejected: number;
  reasons: { raw: string; reason: string }[];
}

const AdminPanel: React.FC = () => {
  const { questions, addQuestion, deleteQuestion, subjects } = useApp();
  const [activeTab, setActiveTab] = useState<'manual' | 'hindi'>('manual');
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const [hindiError, setHindiError] = useState<string | null>(null);
  
  const [ingestionSummary, setIngestionSummary] = useState<IngestionSummary | null>(null);
  const [extractedQuestions, setExtractedQuestions] = useState<Omit<Question, 'id'>[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [formData, setFormData] = useState<Omit<Question, 'id'>>({
    examName: 'UP Police Computer Operator',
    subject: 'Computer Science (कंप्यूटर विज्ञान)',
    topic: '',
    difficulty: Difficulty.MEDIUM,
    questionText: '',
    options: { A: '', B: '', C: '', D: '' },
    correctAnswer: 'A',
    explanation: '',
    year: '2024',
    source: ''
  });

  const containsUnicodeHindi = (text: string) => /[\u0900-\u097F]/.test(text);

  const chunkInputText = (text: string): string[] => {
    const splitRegex = /\n(?=(?:[Qq]\d+[\.\)\s]|\d+[\.\)\s]))/;
    const segments = text.split(splitRegex).filter(s => s.trim().length > 0);
    
    const chunks: string[] = [];
    const chunkSize = 12; // Slightly smaller chunks for production stability
    for (let i = 0; i < segments.length; i += chunkSize) {
      chunks.push(segments.slice(i, i + chunkSize).join('\n\n'));
    }
    return chunks.length === 0 && text.trim().length > 0 ? [text] : chunks;
  };

  const handleBulkIngestHindi = async () => {
    if (!formData.questionText) {
      alert("Please paste the raw Hindi questions text first.");
      return;
    }

    const chunks = chunkInputText(formData.questionText);
    setIsProcessing(true);
    setBatchProgress({ current: 0, total: chunks.length });
    setHindiError(null);
    setIngestionSummary(null);
    
    let allValid: any[] = [];
    let allRejected: any[] = [];

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        throw new Error("API_KEY is missing. Please configure it in Netlify Environment Variables.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const systemPrompt = `You are a bulk question ingestion assistant.
      Task: Convert legacy fonts to Unicode Hindi. Extract Question, Options A-D, Answer, Explanation, and Difficulty.
      Current Metadata: Exam: ${formData.examName}, Subject: ${formData.subject}, Topic: ${formData.topic || 'Bulk Ingest'}`;

      const schema = {
        type: Type.OBJECT,
        properties: {
          validQuestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                questionText: { type: Type.STRING },
                A: { type: Type.STRING },
                B: { type: Type.STRING },
                C: { type: Type.STRING },
                D: { type: Type.STRING },
                correctAnswer: { type: Type.STRING, enum: ["A", "B", "C", "D"] },
                explanation: { type: Type.STRING },
                difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] }
              },
              required: ["questionText", "A", "B", "C", "D", "correctAnswer", "difficulty"]
            }
          },
          rejected: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                rawSnippet: { type: Type.STRING },
                reason: { type: Type.STRING }
              }
            }
          }
        },
        required: ["validQuestions", "rejected"]
      };

      for (let i = 0; i < chunks.length; i++) {
        setBatchProgress({ current: i + 1, total: chunks.length });
        
        // Add a small 500ms delay between batches to prevent triggering production rate limits/WAFs
        if (i > 0) await new Promise(r => setTimeout(r, 500));

        const result = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Process this batch (#${i+1}/${chunks.length}):\n\n${chunks[i]}`,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json",
            responseSchema: schema
          }
        });

        if (!result.text) throw new Error(`Empty response from AI for batch ${i+1}`);

        const parsed = JSON.parse(result.text);
        
        if (parsed.validQuestions) {
          const processed = parsed.validQuestions.map((q: any) => ({
            ...q,
            examName: formData.examName,
            subject: formData.subject,
            topic: formData.topic || 'Bulk Ingest',
            options: { A: q.A, B: q.B, C: q.C, D: q.D },
            year: '2024',
            source: 'Bulk Paste'
          }));
          allValid = [...allValid, ...processed];
        }
        
        if (parsed.rejected) {
          allRejected = [...allRejected, ...parsed.rejected];
        }
      }

      setExtractedQuestions(allValid);
      setIngestionSummary({
        totalDetected: allValid.length + allRejected.length,
        accepted: allValid.length,
        rejected: allRejected.length,
        reasons: allRejected.map((r: any) => ({ raw: r.rawSnippet, reason: r.reason }))
      });
      
    } catch (error: any) {
      console.error("Bulk Ingestion Error:", error);
      let errorMsg = "An unexpected error occurred.";
      
      if (error.message?.includes("API_KEY")) {
        errorMsg = "API Key not found in production environment.";
      } else if (error.message?.includes("401")) {
        errorMsg = "Invalid API Key. Please check your credentials.";
      } else if (error.message?.includes("429")) {
        errorMsg = "Rate limit exceeded. Try again in a few minutes.";
      } else if (error.name === "SyntaxError") {
        errorMsg = "AI returned malformed data. Try processing a smaller block.";
      }
      
      setHindiError(`❌ Error: ${errorMsg}`);
      alert(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const importSingle = (idx: number) => {
    addQuestion(extractedQuestions[idx]);
    setExtractedQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const importAll = () => {
    extractedQuestions.forEach(q => addQuestion(q));
    setExtractedQuestions([]);
    setIngestionSummary(null);
    setFormData({ ...formData, questionText: '', options: { A: '', B: '', C: '', D: '' }, explanation: '' });
    setHindiError(null);
    alert("Bulk import complete!");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'hindi' && !isBulkMode) {
      if (!containsUnicodeHindi(formData.questionText)) {
        setHindiError("⚠️ Invalid Hindi font detected. Please use proper Unicode Hindi.");
        return;
      }
    }
    addQuestion(formData);
    setFormData({ ...formData, questionText: '', explanation: '', options: { A: '', B: '', C: '', D: '' } });
    setHindiError(null);
    alert("Question saved!");
  };

  const startCamera = async () => {
    setIsScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Camera access denied.");
      setIsScanning(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      ctx?.drawImage(videoRef.current, 0, 0);
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-12 pb-24 max-w-7xl mx-auto">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            Question Ingestion
          </h1>
          <p className="text-slate-500 font-medium text-lg">Production-ready AI structure for Hindi bank.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => { setActiveTab('hindi'); setIsBulkMode(false); }}
            className={`flex items-center gap-3 px-8 py-5 rounded-[2rem] font-black text-sm shadow-xl transition-all hover:-translate-y-1 ${activeTab === 'hindi' && !isBulkMode ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-600'}`}
          >
            ➕ Build Hindi Question
          </button>
          <button
            onClick={startCamera}
            className="flex items-center gap-3 px-8 py-5 bg-blue-600 text-white rounded-[2rem] font-black text-sm shadow-xl hover:bg-blue-700 transition-all hover:-translate-y-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
            Live Scan
          </button>
        </div>
      </div>

      {isScanning && (
        <div className="fixed inset-0 z-[180] bg-black flex flex-col">
          <video ref={videoRef} autoPlay playsInline className="flex-1 object-contain" />
          <canvas ref={canvasRef} className="hidden" />
          <div className="p-16 flex justify-center bg-slate-900">
            <button onClick={capturePhoto} className="w-24 h-24 bg-white rounded-full border-[8px] border-slate-300"></button>
            <button onClick={() => setIsScanning(false)} className="absolute right-10 top-10 text-white font-black">CLOSE</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-10">
          <div className="bg-white p-14 rounded-[4rem] border border-slate-100 shadow-2xl space-y-10 relative overflow-hidden">
             <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-orange-400 to-red-600"></div>
             
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                   <h2 className="text-3xl font-black text-slate-900 tracking-tight">Hindi Question Builder</h2>
                   <p className="text-slate-500 font-bold">Resilient Production Ingestion</p>
                </div>
                <div className="flex p-1.5 bg-slate-100 rounded-2xl">
                   <button 
                    onClick={() => { setIsBulkMode(false); setIngestionSummary(null); setExtractedQuestions([]); }}
                    className={`px-6 py-3 rounded-xl font-black text-xs transition-all ${!isBulkMode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                   >
                     Single Entry
                   </button>
                   <button 
                    onClick={() => { setIsBulkMode(true); setHindiError(null); }}
                    className={`px-6 py-3 rounded-xl font-black text-xs transition-all ${isBulkMode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                   >
                     Bulk Ingestion (AI)
                   </button>
                </div>
             </div>

             {hindiError && (
               <div className={`p-6 border-2 rounded-3xl font-bold flex items-center gap-4 animate-in fade-in slide-in-from-top-4 ${hindiError.startsWith('✨') ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                 <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" /></svg>
                 {hindiError}
               </div>
             )}

             <form onSubmit={handleSubmit} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Examination</label>
                     <select className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-slate-100 font-black text-slate-900" value={formData.examName} onChange={e => setFormData({...formData, examName: e.target.value})}>
                        <option>UP Police Computer Operator</option>
                        <option>Homeguard</option>
                        <option>RRB Group D</option>
                     </select>
                   </div>
                   <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                     <select className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-slate-100 font-black text-slate-900" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}>
                        {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                     </select>
                   </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    {isBulkMode ? 'Bulk Text Paste' : 'Question Text'}
                  </label>
                  <textarea 
                    required 
                    className="w-full p-8 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100 font-bold text-slate-900 h-64 text-xl outline-none focus:border-orange-500 transition-colors"
                    placeholder={isBulkMode ? "Paste multiple questions here..." : "यहाँ हिंदी प्रश्न टाइप करें..."}
                    value={formData.questionText}
                    onChange={e => { setFormData({...formData, questionText: e.target.value}); setHindiError(null); }}
                  />
                </div>

                {!isBulkMode && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {['A', 'B', 'C', 'D'].map(opt => (
                        <div key={opt} className="relative">
                          <span className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center font-black text-slate-400 text-xs">{opt}</span>
                          <input required type="text" className="w-full pl-16 p-5 bg-slate-50 rounded-2xl border-2 border-slate-100 font-bold text-slate-900" placeholder={`Option ${opt}`} value={formData.options[opt as keyof typeof formData.options]} onChange={e => setFormData({...formData, options: {...formData.options, [opt]: e.target.value}})} />
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div className="pt-6 flex justify-end gap-6">
                   <button type="button" onClick={() => { setFormData({...formData, questionText: '', options: {A:'',B:'',C:'',D:''}}); setHindiError(null); setIngestionSummary(null); }} className="text-slate-400 font-black text-xs uppercase tracking-widest hover:text-rose-500">Reset</button>
                   {isBulkMode ? (
                     <button type="button" onClick={handleBulkIngestHindi} disabled={isProcessing} className="px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black shadow-2xl disabled:opacity-50">
                        {isProcessing ? 'Ingesting...' : 'Start Bulk Process'}
                     </button>
                   ) : (
                     <button type="submit" className="px-12 py-5 bg-orange-600 text-white rounded-[2rem] font-black shadow-2xl">Save Single</button>
                   )}
                </div>
             </form>
          </div>

          {ingestionSummary && (
            <div className="space-y-8 animate-in slide-in-from-bottom-10">
               <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white flex items-center justify-between gap-10 shadow-2xl relative overflow-hidden">
                  <div className="relative z-10 space-y-2">
                     <h3 className="text-3xl font-black tracking-tight">Process Result</h3>
                     <p className="text-slate-400 font-bold">Consolidated report.</p>
                  </div>
                  <div className="relative z-10 flex gap-8">
                     <div className="text-center">
                        <div className="text-3xl font-black text-emerald-400">{ingestionSummary.accepted}</div>
                        <div className="text-[8px] font-black uppercase text-slate-500 mt-1">Accepted</div>
                     </div>
                     <div className="text-center">
                        <div className="text-3xl font-black text-rose-500">{ingestionSummary.rejected}</div>
                        <div className="text-[8px] font-black uppercase text-slate-500 mt-1">Rejected</div>
                     </div>
                  </div>
                  {ingestionSummary.accepted > 0 && (
                    <button onClick={importAll} className="relative z-10 px-10 py-5 bg-emerald-500 text-slate-900 rounded-[2rem] font-black">Import All</button>
                  )}
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {extractedQuestions.map((q, idx) => (
                    <div key={idx} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-8 flex flex-col h-full group hover:border-orange-200 transition">
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{q.subject}</span>
                          <span className={`px-4 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${q.difficulty === Difficulty.EASY ? 'bg-emerald-50 text-emerald-600' : q.difficulty === Difficulty.MEDIUM ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
                            {q.difficulty}
                          </span>
                       </div>
                       <p className="text-lg font-bold text-slate-900 leading-snug flex-1">{q.questionText}</p>
                       <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                          <button onClick={() => setExtractedQuestions(prev => prev.filter((_, i) => i !== idx))} className="text-xs font-black text-slate-300 hover:text-rose-500">Discard</button>
                          <button onClick={() => importSingle(idx)} className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs">Import</button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-4">
           <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-2xl h-[1000px] flex flex-col sticky top-24">
              <h4 className="text-xl font-black text-slate-900 mb-8 pb-4 border-b border-slate-50">Mock Bank ({questions.length})</h4>
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                 {questions.map((q) => (
                   <div key={q.id} className="p-6 bg-slate-50/50 rounded-3xl border border-slate-50 group relative">
                      <div className="flex justify-between items-start">
                         <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{q.subject}</span>
                         <button onClick={() => deleteQuestion(q.id)} className="opacity-0 group-hover:opacity-100 text-rose-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                         </button>
                      </div>
                      <p className="text-xs font-bold text-slate-700 line-clamp-2">{q.questionText}</p>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {isProcessing && (
        <div className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center">
           <div className="bg-white p-14 rounded-[4rem] text-center space-y-8 animate-in zoom-in-95 shadow-2xl">
              <div className="w-24 h-24 mx-auto relative">
                <div className="absolute inset-0 border-8 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <h3 className="text-3xl font-black text-slate-900">Processing Batches...</h3>
              <p className="text-slate-500 font-bold">Batch {batchProgress.current} / {batchProgress.total}</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
