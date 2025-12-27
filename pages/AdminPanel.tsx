
import React, { useState, useRef } from 'react';
import { useApp } from '../store';
import { Difficulty, Question } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

interface FailedBatch {
  chunkIndex: number;
  rawText: string;
  error: string;
}

const AdminPanel: React.FC = () => {
  const { questions, addQuestion, deleteQuestion, subjects } = useApp();
  const [activeTab, setActiveTab] = useState<'manual' | 'bulk' | 'pdf'>('manual');
  const [isProcessing, setIsProcessing] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0, saved: 0 });
  const [failedBatches, setFailedBatches] = useState<FailedBatch[]>([]);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const wait = (ms: number) => new Promise(res => setTimeout(res, ms));

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handlePDFIngest = async () => {
    if (!pdfFile) {
      alert("Please select a PDF file first.");
      return;
    }

    setIsProcessing(true);
    setAdminError(null);
    setBatchProgress({ current: 1, total: 1, saved: 0 });

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API_KEY missing in environment.");

      const base64Data = await fileToBase64(pdfFile);
      const ai = new GoogleGenAI({ apiKey });

      const schema = {
        type: Type.OBJECT,
        properties: {
          questions: {
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
              required: ["questionText", "A", "B", "C", "D", "correctAnswer"]
            }
          }
        },
        required: ["questions"]
      };

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            inlineData: {
              data: base64Data,
              mimeType: 'application/pdf'
            }
          },
          {
            text: `EXTRACT QUESTIONS FROM THIS PDF. 
            - Convert all Hindi text to Unicode.
            - Assign Metadata: Exam: ${formData.examName}, Subject: ${formData.subject}.
            - Output as JSON following the schema.`
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: schema
        }
      });

      const data = JSON.parse(response.text || '{"questions":[]}');
      let savedCount = 0;

      if (data.questions && data.questions.length > 0) {
        data.questions.forEach((q: any) => {
          addQuestion({
            examName: formData.examName,
            subject: formData.subject,
            topic: formData.topic || 'PDF Extraction',
            difficulty: q.difficulty || Difficulty.MEDIUM,
            questionText: q.questionText,
            options: { A: q.A, B: q.B, C: q.C, D: q.D },
            correctAnswer: q.correctAnswer as any,
            explanation: q.explanation || '',
            year: '2024',
            source: pdfFile.name
          });
          savedCount++;
        });
        setBatchProgress(prev => ({ ...prev, saved: savedCount }));
        alert(`Successfully imported ${savedCount} questions from PDF!`);
        setPdfFile(null);
      } else {
        throw new Error("No questions could be extracted from this document.");
      }

    } catch (error: any) {
      console.error("PDF Extraction Error:", error);
      setAdminError(`❌ PDF Error: ${error.message || "Failed to parse document"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkIngestHindi = async () => {
    if (!formData.questionText.trim()) {
      alert("Please provide text.");
      return;
    }

    const chunks = formData.questionText.split('\n\n').filter(c => c.trim().length > 10);
    setIsProcessing(true);
    setFailedBatches([]);
    setBatchProgress({ current: 0, total: chunks.length, saved: 0 });

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      setAdminError("❌ API_KEY missing.");
      setIsProcessing(false);
      return;
    }

    const ai = new GoogleGenAI({ apiKey });
    const schema = {
      type: Type.OBJECT,
      properties: {
        questions: {
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
            required: ["questionText", "A", "B", "C", "D", "correctAnswer"]
          }
        }
      },
      required: ["questions"]
    };

    let totalSaved = 0;
    for (let i = 0; i < chunks.length; i++) {
      setBatchProgress(prev => ({ ...prev, current: i + 1 }));
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Ingest these questions:\n${chunks[i]}`,
          config: { responseMimeType: "application/json", responseSchema: schema }
        });
        const data = JSON.parse(response.text || '{"questions":[]}');
        data.questions?.forEach((q: any) => {
          addQuestion({ ...formData, ...q, options: { A: q.A, B: q.B, C: q.C, D: q.D } });
          totalSaved++;
        });
        setBatchProgress(prev => ({ ...prev, saved: totalSaved }));
        await wait(500);
      } catch (err: any) {
        setFailedBatches(p => [...p, { chunkIndex: i + 1, rawText: chunks[i].slice(0, 50), error: err.message }]);
      }
    }
    setIsProcessing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addQuestion(formData);
    setFormData({ ...formData, questionText: '', explanation: '', options: { A: '', B: '', C: '', D: '' } });
    alert("Question saved!");
  };

  return (
    <div className="space-y-12 pb-24 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Admin Control</h1>
          <p className="text-slate-500 font-bold">Manage questions and sync document banks</p>
        </div>
        <div className="flex p-1.5 bg-slate-100 rounded-3xl">
          <button onClick={() => setActiveTab('manual')} className={`px-8 py-3 rounded-2xl font-black text-xs transition-all ${activeTab === 'manual' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>Manual</button>
          <button onClick={() => setActiveTab('bulk')} className={`px-8 py-3 rounded-2xl font-black text-xs transition-all ${activeTab === 'bulk' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>Bulk Text</button>
          <button onClick={() => setActiveTab('pdf')} className={`px-8 py-3 rounded-2xl font-black text-xs transition-all ${activeTab === 'pdf' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>PDF Smart</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl space-y-10 relative overflow-hidden">
             <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600"></div>
             
             {adminError && (
               <div className="p-6 bg-rose-50 border-2 border-rose-100 rounded-3xl text-rose-700 font-bold flex items-center gap-4 animate-in slide-in-from-top-4">
                 <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" /></svg>
                 {adminError}
               </div>
             )}

             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Exam</label>
                  <select className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-slate-100 font-black text-slate-900" value={formData.examName} onChange={e => setFormData({...formData, examName: e.target.value})}>
                     <option>UP Police Computer Operator</option>
                     <option>Homeguard</option>
                     <option>RRB Group D</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject Category</label>
                  <select className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-slate-100 font-black text-slate-900" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}>
                     {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
             </div>

             {activeTab === 'manual' && (
               <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Question Content</label>
                    <textarea 
                      required
                      className="w-full p-8 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100 font-bold h-48 outline-none focus:border-blue-500 transition-colors"
                      placeholder="Type question text here..."
                      value={formData.questionText}
                      onChange={e => setFormData({...formData, questionText: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {['A', 'B', 'C', 'D'].map(opt => (
                      <input key={opt} required type="text" className="p-5 bg-slate-50 rounded-2xl border-2 border-slate-100 font-bold" placeholder={`Option ${opt}`} value={formData.options[opt as keyof typeof formData.options]} onChange={e => setFormData({...formData, options: {...formData.options, [opt]: e.target.value}})} />
                    ))}
                  </div>
                  <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black shadow-xl hover:bg-black transition-all">Save Question</button>
               </form>
             )}

             {activeTab === 'bulk' && (
               <div className="space-y-8 animate-in fade-in">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Paste Raw Text</label>
                    <textarea 
                      className="w-full p-8 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100 font-bold h-64 outline-none focus:border-blue-500 transition-colors"
                      placeholder="Paste multiple questions. Separate questions with double new lines..."
                      value={formData.questionText}
                      onChange={e => setFormData({...formData, questionText: e.target.value})}
                    />
                  </div>
                  <button onClick={handleBulkIngestHindi} disabled={isProcessing} className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black shadow-xl hover:bg-blue-700 transition-all disabled:opacity-50">
                    {isProcessing ? 'Processing Batches...' : 'Run Bulk AI Import'}
                  </button>
               </div>
             )}

             {activeTab === 'pdf' && (
               <div className="space-y-8 animate-in fade-in">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-4 border-dashed rounded-[3rem] p-16 text-center transition-all cursor-pointer ${pdfFile ? 'border-emerald-200 bg-emerald-50' : 'border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-slate-200'}`}
                  >
                    <input type="file" ref={fileInputRef} className="hidden" accept="application/pdf" onChange={e => setPdfFile(e.target.files?.[0] || null)} />
                    <div className="space-y-4">
                      <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center shadow-lg transition-colors ${pdfFile ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400'}`}>
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xl font-black text-slate-900">{pdfFile ? pdfFile.name : "Select Exam PDF Book"}</h4>
                        <p className="text-slate-500 font-bold text-sm">{pdfFile ? `${(pdfFile.size/1024/1024).toFixed(2)} MB • Ready to scan` : "AI will scan the layout and extract questions automatically"}</p>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={handlePDFIngest} 
                    disabled={!pdfFile || isProcessing} 
                    className="w-full py-5 bg-purple-600 text-white rounded-[2rem] font-black shadow-xl hover:bg-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Scanning Document...
                      </>
                    ) : 'Start Smart PDF Extraction'}
                  </button>
               </div>
             )}
          </div>

          {failedBatches.length > 0 && (
            <div className="bg-rose-50 p-10 rounded-[3rem] border-2 border-rose-100 space-y-4 animate-in slide-in-from-bottom-6">
              <h3 className="text-lg font-black text-rose-800 uppercase tracking-widest flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                Failed Items ({failedBatches.length})
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {failedBatches.map((fb, i) => (
                  <div key={i} className="bg-white p-5 rounded-2xl border border-rose-100 text-xs font-bold text-slate-600">
                    Batch #{fb.chunkIndex}: {fb.error}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-4">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl sticky top-24">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Question Bank</h3>
              <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-sm font-black">{questions.length}</span>
            </div>
            <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
              {questions.map(q => (
                <div key={q.id} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:shadow-lg">
                  <div className="flex justify-between items-start gap-4">
                    <p className="text-xs font-bold text-slate-700 line-clamp-2 flex-1">{q.questionText}</p>
                    <button onClick={() => deleteQuestion(q.id)} className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-600 transition-opacity">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{q.subject}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${q.difficulty === Difficulty.HARD ? 'bg-rose-400' : q.difficulty === Difficulty.MEDIUM ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                  </div>
                </div>
              ))}
              {questions.length === 0 && (
                <div className="py-20 text-center text-slate-300 font-bold italic text-sm">Empty Question Set</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isProcessing && (
        <div className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-8">
           <div className="bg-white p-12 rounded-[4rem] text-center max-w-lg w-full space-y-10 animate-in zoom-in-95 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600"></div>
              
              <div className="relative w-28 h-28 mx-auto">
                 <div className="absolute inset-0 border-[8px] border-slate-50 rounded-full"></div>
                 <div className="absolute inset-0 border-[8px] border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                 <div className="absolute inset-0 flex items-center justify-center font-black text-blue-600 text-lg">
                    {activeTab === 'pdf' ? 'DOC' : `${Math.round((batchProgress.current/batchProgress.total)*100)}%`}
                 </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                  {activeTab === 'pdf' ? 'Analyzing Document' : 'Ingesting Batches'}
                </h3>
                <p className="text-slate-500 font-bold">
                  {activeTab === 'pdf' ? 'Gemini AI is reading your PDF file...' : `Processing section ${batchProgress.current} of ${batchProgress.total}`}
                </p>
              </div>

              <div className="p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100 flex flex-col items-center gap-2">
                 <div className="text-blue-600 font-black text-5xl">{batchProgress.saved}</div>
                 <div className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Questions Synced Securely</div>
              </div>

              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">
                System Active • Atomic Save Enabled
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
