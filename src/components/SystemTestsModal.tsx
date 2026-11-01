import React, { useState, useEffect } from 'react';
import { runAllAutomatedTests, TestSuiteSummary } from '../utils/examEngineTests';
import {
  Activity,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  X,
  Clock,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface SystemTestsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemTestsModal: React.FC<SystemTestsModalProps> = ({ isOpen, onClose }) => {
  const [testSummary, setTestSummary] = useState<TestSuiteSummary | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const executeTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const summary = runAllAutomatedTests();
      setTestSummary(summary);
      setIsRunning(false);
    }, 200);
  };

  useEffect(() => {
    if (isOpen && !testSummary) {
      executeTests();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 my-8">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  स्वचालित यूनिट टेस्ट (Automated Test Suite)
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                एग्जाम इंजन एवं बिजनेस लॉजिक सत्यापन
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label="बंद करें"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action & Stats Bar */}
        <div className="my-5 flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-4">
          <div className="flex items-center gap-4 text-xs font-semibold">
            {testSummary ? (
              <>
                <span className="text-emerald-700 flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>उत्तीर्ण (Passed): {testSummary.passed}/{testSummary.total}</span>
                </span>
                <span className="text-slate-500">
                  अवधि: {testSummary.durationMs}ms
                </span>
              </>
            ) : (
              <span className="text-slate-500">परीक्षण प्रगति पर है...</span>
            )}
          </div>

          <button
            onClick={executeTests}
            disabled={isRunning}
            className="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            <span>पुनः टेस्ट चलाएं</span>
          </button>
        </div>

        {/* Test List */}
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {testSummary?.results.map((res, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 transition ${
                res.passed
                  ? 'bg-emerald-50/50 border-emerald-200 text-slate-900'
                  : 'bg-rose-50 border-rose-200 text-rose-950'
              }`}
            >
              {res.passed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}

              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold">{res.name}</span>
                  <span className="text-[10px] bg-white border px-1.5 py-0.5 rounded text-slate-500 font-mono">
                    {res.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">{res.message}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
          >
            बंद करें
          </button>
        </div>
      </div>
    </div>
  );
};
