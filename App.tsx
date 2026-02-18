
import React, { useState, useEffect } from 'react';
import { analyzeVideoFrames, extractFramesFromVideo } from './services/geminiService';
import { VideoFile, PolicyAnalysis, HistoryEntry } from './types';
import AnalysisDisplay from './components/AnalysisDisplay';

const STORAGE_KEY = 'yt_dhamma_video_history_v3';

const App: React.FC = () => {
  const [video, setVideo] = useState<VideoFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<PolicyAnalysis | null>(null);
  const [currentThumbnail, setCurrentThumbnail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHistory(parsed);
      } catch (e) {
        console.error("History parse error", e);
      }
    }
  }, []);

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideo({ file, preview: URL.createObjectURL(file) });
      setAnalysis(null);
      setCurrentThumbnail(null);
      setError(null);
    }
  };

  const resetForNext = () => {
    setVideo(null);
    setAnalysis(null);
    setCurrentThumbnail(null);
    setError(null);
    setShowHistory(false);
  };

  const handleRunAnalysis = async () => {
    if (!video) return;
    setLoading(true);
    setError(null);

    try {
      const { frames, thumbnail } = await extractFramesFromVideo(video.file);
      setCurrentThumbnail(thumbnail);
      
      const result = await analyzeVideoFrames(frames, history);
      setAnalysis(result);

      if (!result.historyCheck.isSimilarToPast) {
        const newEntry: HistoryEntry = {
          timestamp: Date.now(),
          visualSignature: result.visualSignature,
          previewThumbnail: thumbnail
        };

        const updatedHistory = [newEntry, ...history].slice(0, 200); 
        setHistory(updatedHistory);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
      }
    } catch (err) {
      setError("စစ်ဆေးမှု ပြုလုပ်ရာတွင် အခက်အခဲရှိနေပါသည်။ အင်တာနက်ကို ပြန်စစ်ကြည့်ပါ။");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteHistoryEntry = (index: number) => {
    const updatedHistory = history.filter((_, i) => i !== index);
    setHistory(updatedHistory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  };

  const clearDatabase = () => {
    if (window.confirm("သိမ်းထားသော ဗီဒီယိုမှတ်တမ်း အားလုံးကို ဖျက်ပစ်ရန် သေချာပါသလား?")) {
      setHistory([]);
      localStorage.removeItem(STORAGE_KEY);
      resetForNext();
    }
  };

  const getMatchedThumbnail = () => {
    if (analysis?.historyCheck?.isSimilarToPast && analysis.historyCheck.matchedVideoIndex !== undefined) {
      const idx = analysis.historyCheck.matchedVideoIndex - 1;
      return history[idx]?.previewThumbnail || null;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] font-sans pb-12">
      <header className="bg-white/90 backdrop-blur-md border-b py-3 px-6 md:px-10 sticky top-0 z-50 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => resetForNext()}>
          <div className="bg-orange-600 p-2 rounded-xl shadow-md">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-black text-gray-900 leading-none tracking-tight">Dharma Content Guard</h1>
            <p className="text-[9px] text-orange-600 font-bold uppercase tracking-widest mt-0.5">Repetitive Content AI</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className={`text-[9px] font-black px-4 py-2 rounded-lg border transition-all uppercase ${showHistory ? 'bg-orange-600 border-orange-600 text-white' : 'bg-gray-50 border-gray-100 text-gray-500 hover:text-orange-600'}`}
          >
            Database ({history.length})
          </button>
          {history.length > 0 && showHistory && (
            <button onClick={clearDatabase} className="text-[9px] font-black text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all uppercase">Reset</button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-8">
        {showHistory ? (
          <div className="animate-in fade-in slide-in-from-right duration-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-gray-900">မှတ်တမ်းများ</h2>
              <button onClick={() => setShowHistory(false)} className="bg-white border border-gray-100 text-gray-500 px-4 py-2 rounded-xl text-sm font-black hover:text-orange-600 transition-all flex items-center">
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                ပြန်သွားမည်
              </button>
            </div>
            
            {history.length === 0 ? (
              <div className="bg-white p-20 rounded-[40px] text-center border-2 border-dashed border-gray-100 shadow-inner">
                <p className="text-gray-400 font-bold text-lg uppercase tracking-widest">Database လွတ်နေပါသည်</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {history.map((item, idx) => (
                  <div key={idx} className="bg-white p-3.5 rounded-[25px] shadow-sm border border-gray-100 group hover:shadow-lg transition-all relative">
                    <div className="absolute top-6 right-6 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button 
                        onClick={() => deleteHistoryEntry(idx)}
                        className="bg-white/90 p-2 rounded-xl text-rose-500 shadow-md"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                    <img src={item.previewThumbnail} className="w-full aspect-video object-cover rounded-[20px] mb-3 bg-gray-50" alt="Video Record" />
                    <div className="px-1 flex justify-between items-center">
                      <p className="text-gray-900 font-black text-sm">ID #{history.length - idx}</p>
                      <span className="text-[8px] text-gray-400 font-bold uppercase">{new Date(item.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : analysis ? (
          <div className="animate-in fade-in slide-in-from-top duration-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-gray-900 uppercase">စစ်ဆေးချက် ရလဒ်</h2>
              <button 
                onClick={resetForNext}
                className="bg-orange-600 text-white px-6 py-2.5 rounded-xl font-black text-sm hover:bg-orange-700 transition-all shadow-lg shadow-orange-100 flex items-center space-x-2 active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
                </svg>
                <span>ထပ်စစ်မည်</span>
              </button>
            </div>
            <AnalysisDisplay 
              analysis={analysis} 
              currentThumbnail={currentThumbnail} 
              matchedThumbnail={getMatchedThumbnail()} 
            />
          </div>
        ) : (
          <>
            <div className="text-center mb-10 max-w-xl mx-auto">
              <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight leading-tight">
                {history.length === 0 ? "ဗီဒီယို သိမ်းဆည်းရန်" : "ဗီဒီယို တိုက်စစ်ရန်"}
              </h2>
              <p className="text-gray-500 font-medium text-sm">
                {history.length === 0 
                  ? "YouTube Repetitive Policy အတွက် ပထမဆုံး ဗီဒီယိုကို သိမ်းဆည်းပါ။" 
                  : `Database ရှိ ဗီဒီယို ${history.length} ခုနှင့် တိုက်စစ်ပေးပါမည်။`}
              </p>
            </div>

            <div className="max-w-2xl mx-auto mb-8">
              <label className={`
                relative flex flex-col items-center justify-center w-full h-[360px] rounded-[40px] border-4 border-dashed transition-all cursor-pointer overflow-hidden
                ${video ? 'border-orange-500 bg-white shadow-xl scale-[1.01]' : 'border-gray-200 hover:border-orange-300 bg-white'}
              `}>
                {video ? (
                  <video src={video.preview} className="w-full h-full object-cover" controls muted />
                ) : (
                  <div className="flex flex-col items-center p-8 text-center group">
                    <div className="w-20 h-20 bg-orange-50 rounded-[30px] flex items-center justify-center mb-6 border border-orange-100 group-hover:scale-105 transition-all">
                      <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-xl font-black text-gray-800 tracking-tight">ဗီဒီယိုဖိုင် ရွေးချယ်ရန်</p>
                    <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest bg-gray-50 px-4 py-1.5 rounded-full">Base Video (8s)</p>
                  </div>
                )}
                <input type="file" className="hidden" accept="video/*" onChange={handleVideoUpload} />
              </label>
            </div>

            <div className="flex flex-col items-center mb-16">
              {error && <div className="mb-6 text-red-600 font-bold bg-red-50 px-8 py-3 rounded-2xl border border-red-100 text-sm">{error}</div>}
              <button
                onClick={handleRunAnalysis}
                disabled={loading || !video}
                className={`
                  px-16 py-5 rounded-[30px] text-xl font-black shadow-xl transition-all transform active:scale-95
                  ${loading || !video ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' : 'bg-orange-600 text-white hover:bg-orange-700 hover:-translate-y-1 shadow-orange-100'}
                `}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>စစ်ဆေးနေပါသည်...</span>
                  </div>
                ) : (history.length === 0 ? "သိမ်းဆည်းမည်" : "တိုက်စစ်မည်")}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default App;
