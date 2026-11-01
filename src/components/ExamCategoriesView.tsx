import React from 'react';
import { useExam } from '../context/ExamContext';
import { EXAM_CATEGORIES } from '../data/mockData';
import { ExamClassId } from '../types';
import {
  ShieldCheck,
  Calendar,
  CheckCircle2,
  FileText,
  Award,
  ArrowRight,
  BookOpen,
  Sparkles,
} from 'lucide-react';

export const ExamCategoriesView: React.FC = () => {
  const { selectedClassId, setSelectedClassId, setCurrentView } = useExam();

  const handleSelectAndPractice = (catId: ExamClassId) => {
    setSelectedClassId(catId);
    setCurrentView('home');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
            बिहार विद्यालय परीक्षा समिति (BSEB)
          </span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs text-slate-500 font-medium">सत्र 2025-2026 आधिकारिक प्रारूप</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">
          परीक्षा श्रेणियाँ एवं नवीनतम सिलेबस पैटर्न (Exam Categories & Syllabus)
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
          बिहार बोर्ड की परीक्षाओं के आधिकारिक प्रारूप, 100% वस्तुनिष्ठ प्रश्न प्रणाली, अंकन योजना
          और विषयवार संरचना की प्रामाणिक जानकारी यहाँ दी गई है।
        </p>
      </div>

      {/* Categories Cards List */}
      <div className="space-y-5">
        {EXAM_CATEGORIES.map((cat) => {
          const isSelected = selectedClassId === cat.id;

          return (
            <div
              key={cat.id}
              className={`bg-white rounded-3xl border p-5 sm:p-7 shadow-xs transition-all ${
                isSelected
                  ? 'border-blue-900 ring-2 ring-blue-900/10'
                  : 'border-slate-200 hover:border-blue-300'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-orange-100 text-orange-800">
                      {cat.badge}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{cat.verificationStatus}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>सत्र: {cat.syllabusYear}</span>
                    </span>
                  </div>

                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                    {cat.titleHi}
                  </h2>
                  <p className="text-xs text-slate-500">{cat.titleEn}</p>
                </div>

                <button
                  onClick={() => handleSelectAndPractice(cat.id)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shrink-0 ${
                    isSelected
                      ? 'bg-blue-900 text-white hover:bg-blue-800 shadow-md'
                      : 'bg-slate-100 text-slate-800 hover:bg-blue-900 hover:text-white'
                  }`}
                >
                  <span>{isSelected ? 'वर्तमान चयनित (प्रैक्टिस करें)' : 'यह परीक्षा चुनें'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Description & Pattern Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-1">
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-900" />
                    <span>विवरण एवं उद्देश्य:</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>परीक्षा प्रारूप (Exam Pattern Summary):</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl font-medium leading-relaxed">
                    {cat.examPatternSummary}
                  </p>
                </div>
              </div>

              {/* Popular Subjects Pills */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-semibold mr-1">मुख्य विषय:</span>
                {cat.popularSubjects.map((subj, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium"
                  >
                    {subj}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
