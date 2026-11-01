import React, { useState } from 'react';
import { useExam } from '../context/ExamContext';
import { SUBJECTS_CLASS_10 } from '../data/mockData';
import {
  BookOpen,
  Calculator,
  FlaskConical,
  Globe,
  Scroll,
  Sparkles,
  ChevronRight,
  Play,
  ArrowRight,
  Award,
} from 'lucide-react';

export const SubjectSelectionView: React.FC = () => {
  const {
    tests,
    startTest,
    selectedSubjectId,
    setSelectedSubjectId,
    setCurrentView,
  } = useExam();

  const [activeSubjectId, setActiveSubjectId] = useState<string>(
    selectedSubjectId || SUBJECTS_CLASS_10[0].id
  );

  const activeSubject =
    SUBJECTS_CLASS_10.find((s) => s.id === activeSubjectId) || SUBJECTS_CLASS_10[0];

  // Subject matching tests
  const subjectTests = tests.filter(
    (t) => t.isPublished && (t.subjectId === activeSubject.id || t.subjectId === 'all-subjects')
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">
          विषय एवं अध्यायवार तैयारी (Subject & Chapter Quizzes)
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          बिहार बोर्ड परीक्षा के प्रत्येक अध्याय का वेटेज (अंक भार) और लक्षित बहुविकल्पीय प्रश्न
        </p>
      </div>

      {/* Subject Horizontal Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {SUBJECTS_CLASS_10.map((s) => {
          const isSelected = activeSubjectId === s.id;
          return (
            <button
              key={s.id}
              onClick={() => {
                setActiveSubjectId(s.id);
                setSelectedSubjectId(s.id);
              }}
              className={`px-4 py-3 rounded-2xl border text-left shrink-0 transition-all ${
                isSelected
                  ? 'bg-blue-900 text-white border-blue-950 shadow-md'
                  : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="text-xs font-bold leading-none">{s.nameHi}</div>
              <div
                className={`text-[10px] mt-1 ${
                  isSelected ? 'text-blue-200' : 'text-slate-500'
                }`}
              >
                {s.nameEn}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Subject Content Box */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="text-xs font-bold text-orange-600 uppercase tracking-wide">
              विषय कोड: {activeSubject.code} • कुल अध्याय: {activeSubject.chapters.length}
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
              {activeSubject.nameHi} ({activeSubject.nameEn})
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {subjectTests.length > 0 && (
              <button
                onClick={() => startTest(subjectTests[0])}
                className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>इस विषय का टेस्ट दें</span>
              </button>
            )}
          </div>
        </div>

        {/* Chapters Grid */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            अध्यायवार सूची एवं बोर्ड परीक्षा अंक भार (Chapter Weightage):
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {activeSubject.chapters.map((ch, idx) => (
              <div
                key={ch.id}
                className="p-4 rounded-2xl border border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-white transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-bold text-blue-900">
                      अध्याय {idx + 1}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      {ch.weightage}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-900 transition">
                    {ch.nameHi}
                  </h4>
                  <div className="text-xs text-slate-500 mt-0.5">{ch.nameEn}</div>

                  {/* Key Topics */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {ch.keyTopics.map((top, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[10px] bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md"
                      >
                        {top}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setCurrentView('ai-assistant')}
                    className="text-[11px] font-semibold text-orange-700 hover:text-orange-900 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-orange-500" />
                    <span>AI रिवीजन नोट्स</span>
                  </button>

                  <button
                    onClick={() => {
                      // Start test or demo quiz
                      if (subjectTests.length > 0) {
                        startTest(subjectTests[0]);
                      } else {
                        setCurrentView('home');
                      }
                    }}
                    className="text-xs font-bold text-blue-900 hover:underline flex items-center gap-1"
                  >
                    <span>क्विज़ शुरू करें</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
