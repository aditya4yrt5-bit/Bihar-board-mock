import React, { useState } from 'react';
import { useExam } from '../context/ExamContext';
import {
  Clock,
  HelpCircle,
  ShieldAlert,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  X,
  FileCheck2,
} from 'lucide-react';

export const TestInstructionsModal: React.FC = () => {
  const { activeTest, setActiveTest, setCurrentView } = useExam();
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(true);

  if (!activeTest) return null;

  const handleStartExam = () => {
    if (!agreedToTerms) return;
    setCurrentView('test-player');
  };

  const handleClose = () => {
    setActiveTest(null);
    setCurrentView('home');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 my-8">
        {/* Modal Top Bar */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                {activeTest.isDemoPractice ? 'डेमो अभ्यास टेस्ट' : 'आधिकारिक प्रारूप'}
              </span>
              <span className="text-[11px] text-slate-500">
                सत्र: {activeTest.syllabusYear}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {activeTest.title}
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">{activeTest.subTitle}</p>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            aria-label="बंद करें"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Test Parameters Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-5 text-center">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
            <span className="text-[11px] text-slate-500 block">कुल प्रश्न</span>
            <span className="text-base font-bold text-blue-950">
              {activeTest.totalQuestions}
            </span>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
            <span className="text-[11px] text-slate-500 block">समय सीमा</span>
            <span className="text-base font-bold text-blue-950">
              {activeTest.durationMinutes} मिनट
            </span>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
            <span className="text-[11px] text-slate-500 block">प्रत्येक प्रश्न</span>
            <span className="text-base font-bold text-emerald-700">
              +{activeTest.marksPerQuestion || 1.0} अंक
            </span>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
            <span className="text-[11px] text-slate-500 block">ऋणात्मक अंकन</span>
            <span className="text-base font-bold text-slate-800">
              {activeTest.negativeMarksPerQuestion > 0
                ? `-${activeTest.negativeMarksPerQuestion}`
                : 'कोई नहीं (0.0)'}
            </span>
          </div>
        </div>

        {/* Rules & Guidelines List */}
        <div className="space-y-3 mb-6">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <FileCheck2 className="w-4 h-4 text-blue-900" />
            <span>परीक्षार्थियों के लिए महत्वपूर्ण निर्देश (Instructions):</span>
          </h3>

          <ul className="space-y-2 text-xs sm:text-sm text-slate-700 bg-blue-50/50 border border-blue-100 rounded-2xl p-4">
            {activeTest.instructions && activeTest.instructions.length > 0 ? (
              activeTest.instructions.map((inst, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-blue-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{inst}</span>
                </li>
              ))
            ) : (
              <>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-blue-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <span>प्रत्येक प्रश्न के चार विकल्प (A, B, C, D) हैं, जिनमें से केवल एक सही है।</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-blue-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <span>समय समाप्त होने पर टेस्ट अपने आप सबमिट हो जाएगा।</span>
                </li>
              </>
            )}
            <li className="flex items-start gap-2 text-orange-950 bg-orange-100/60 p-2 rounded-lg font-medium">
              <span className="w-4 h-4 rounded-full bg-orange-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                ★
              </span>
              <span>
                सत्यापन स्थिति: <strong>{activeTest.verificationStatus}</strong>। यह टेस्ट डेमो अभ्यास
                के लिए तैयार किया गया है।
              </span>
            </li>
          </ul>
        </div>

        {/* Question Palette Color Guide */}
        <div className="mb-6 p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <span className="text-[11px] font-bold text-slate-700 block mb-2">
            प्रश्न पैलेट रंगों का अर्थ:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                ✓
              </span>
              <span>उत्तर दिया</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-rose-500 text-white flex items-center justify-center text-[10px]">
                •
              </span>
              <span>उत्तर नहीं दिया</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-purple-600 text-white flex items-center justify-center text-[10px]">
                ?
              </span>
              <span>समीक्षा हेतु चिन्हित</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-slate-200 text-slate-700 flex items-center justify-center text-[10px]">
                0
              </span>
              <span>अभी नहीं देखा</span>
            </div>
          </div>
        </div>

        {/* Agreement Checkbox */}
        <div className="flex items-center gap-2 mb-6 cursor-pointer" onClick={() => setAgreedToTerms(!agreedToTerms)}>
          <input
            type="checkbox"
            id="terms-check"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="w-4 h-4 text-blue-900 rounded border-slate-300 focus:ring-blue-600 cursor-pointer"
          />
          <label htmlFor="terms-check" className="text-xs sm:text-sm text-slate-700 cursor-pointer select-none">
            मैंने सभी निर्देशों को ध्यानपूर्वक पढ़ लिया है और मैं टेस्ट शुरू करने के लिए तैयार हूँ।
          </label>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            onClick={handleClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-100 transition"
          >
            रद्द करें
          </button>
          <button
            onClick={handleStartExam}
            disabled={!agreedToTerms}
            className="px-6 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 transition"
          >
            <span>टेस्ट शुरू करें (Start Test)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
