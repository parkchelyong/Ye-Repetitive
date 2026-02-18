
import React from 'react';
import { PolicyAnalysis } from '../types';

interface AnalysisDisplayProps {
  analysis: PolicyAnalysis;
  currentThumbnail: string | null;
  matchedThumbnail: string | null;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis, currentThumbnail, matchedThumbnail }) => {
  const isSafe = analysis.status === 'Safe';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Safe': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Warning': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'High Risk': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-[25px] shadow-lg p-4 md:p-6 border border-gray-100 animate-in slide-in-from-bottom duration-500 overflow-hidden relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 gap-3 border-b pb-5">
        <div>
          <h2 className="text-xl font-black text-gray-900 mb-0.5">စစ်ဆေးချက် ရလဒ်</h2>
          <div className="flex items-center space-x-2">
            <span className={`w-1.5 h-1.5 rounded-full ${isSafe ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`}></span>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[8px]">YouTube Repetitive Policy</p>
          </div>
        </div>
        <div className={`px-5 py-1.5 rounded-xl border-2 font-black text-base shadow-sm ${getStatusColor(analysis.status)}`}>
          {isSafe ? 'Safe (တင်နိုင်သည်)' : (analysis.status === 'Warning' ? 'Warning' : 'Repetitive (မတင်သင့်)')}
        </div>
      </div>

      {/* Detailed Recommendation - Compact */}
      <div className={`mb-5 p-4 rounded-[20px] border flex items-center space-x-4 ${isSafe ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
        <div className={`p-2.5 rounded-xl shrink-0 ${isSafe ? 'bg-emerald-600' : 'bg-rose-600'} text-white`}>
          {isSafe ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          )}
        </div>
        <div className="flex-1">
          <p className={`leading-snug font-bold text-sm md:text-base ${isSafe ? 'text-emerald-800' : 'text-rose-800'}`}>
            {analysis.recommendations}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
             {analysis.policyViolations.map((v, i) => (
               <span key={i} className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${isSafe ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                 {v}
               </span>
             ))}
          </div>
        </div>
      </div>

      {/* Side by Side Comparison - Compact */}
      {!isSafe && matchedThumbnail && (
        <div className="mb-5 bg-gray-50/80 p-3 rounded-[20px] border border-gray-100">
          <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            အသစ် နှင့် အဟောင်း တိုက်စစ်ချက်
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <div className="absolute top-1.5 left-1.5 z-10 bg-black/60 text-white text-[7px] px-1.5 py-0.5 rounded font-black uppercase">အသစ်</div>
              <img src={currentThumbnail || ''} className="w-full aspect-video object-cover rounded-xl border-2 border-rose-300 shadow-sm" alt="New" />
            </div>
            <div className="relative">
              <div className="absolute top-1.5 left-1.5 z-10 bg-orange-600 text-white text-[7px] px-1.5 py-0.5 rounded font-black uppercase shadow-sm">အဟောင်း</div>
              <img src={matchedThumbnail} className="w-full aspect-video object-cover rounded-xl border-2 border-gray-200 shadow-sm opacity-90 grayscale-[20%]" alt="Matched" />
            </div>
          </div>
          {analysis.historyCheck.details && (
            <p className="mt-2 text-rose-600 font-bold text-[10px] bg-white/60 py-1.5 px-3 rounded-lg italic">
              {analysis.historyCheck.details}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-gray-50/50 p-4 rounded-[20px] border border-gray-100">
          <h3 className="font-black text-gray-400 text-[8px] uppercase tracking-widest mb-2">Technical Profile</h3>
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
               <div className="w-0.5 h-3 bg-orange-400 rounded-full mt-0.5"></div>
               <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase mb-0.5">Subject</p>
                  <p className="text-gray-700 font-bold leading-tight text-[10px]">{analysis.comparisonDetails.subjectMatter}</p>
               </div>
            </div>
            <div className="flex items-start space-x-2">
               <div className="w-0.5 h-3 bg-blue-400 rounded-full mt-0.5"></div>
               <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase mb-0.5">Colors</p>
                  <p className="text-gray-700 font-bold leading-tight text-[10px]">{analysis.comparisonDetails.colors}</p>
               </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900 p-4 rounded-[20px] text-white shadow-md flex flex-col justify-center">
          <h3 className="font-black text-gray-500 text-[8px] uppercase tracking-widest mb-1.5">Visual Fingerprint</h3>
          <p className="text-[9px] font-mono break-all opacity-50 leading-tight line-clamp-2 bg-white/5 p-2 rounded-md">{analysis.visualSignature}</p>
          <div className="mt-2 pt-2 border-t border-white/5">
            <p className="text-[8px] font-bold text-gray-500">
              {isSafe ? 'Database တွင် သိမ်းဆည်းပြီး' : 'မှတ်တမ်းဟောင်းနှင့် တူနေသည်'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDisplay;
