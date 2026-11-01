import React, { useState } from 'react';
import { useExam } from '../context/ExamContext';
import {
  Sparkles,
  Award,
  Clock,
  BookOpen,
  ArrowRight,
  Flame,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  GraduationCap,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Layers,
} from 'lucide-react';
import { EXAM_CATEGORIES, SUBJECTS_CLASS_10 } from '../data/mockData';
import { TestModel, ExamClassId } from '../types';

export const LandingHome: React.FC = () => {
  const {
    selectedClassId,
    setSelectedClassId,
    selectedCategory,
    tests,
    startTest,
    testHistory,
    setActiveAttempt,
    setCurrentView,
    userProfile,
    setSelectedSubjectId,
  } = useExam();

  const [activeTab, setActiveTab] = useState<'all' | 'mock' | 'chapter' | 'daily'>('all');

  // Filter tests for selected class and tab
  const classTests = tests.filter(
    (t) => t.isPublished && (t.classId === selectedClassId || t.classId === 'bseb-class-10-matric')
  );

  const filteredTests = classTests.filter((t) => {
    if (activeTab === 'mock') return t.type === 'mock';
    if (activeTab === 'chapter') return t.type === 'chapter';
    if (activeTab === 'daily') return t.type === 'daily';
    return true;
  });

  const latestAttempt = testHistory.length > 0 ? testHistory[0] : null;

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Hero Banner with Original Branding */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 text-white shadow-xl">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-orange-500/20 via-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-600/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 px-5 py-7 sm:px-8 sm:py-10 max-w-4xl">
          {/* Syllabus Year & Verification Badge */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-500/20 text-amber-300 border border-orange-400/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>सत्र 2025-2026 आधिकारिक पैटर्न</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-blue-100 text-[11px] font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{selectedCategory.verificationStatus}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white">
            बिहार एग्जाम <span className="text-amber-400">गुरु</span>
          </h1>
          <p className="text-amber-300 font-bold text-sm sm:text-base mt-1">
            ‘पढ़ाई स्मार्ट, सफलता शानदार!’
          </p>
          <p className="text-blue-100 text-xs sm:text-sm mt-2.5 max-w-2xl leading-relaxed">
            बिहार विद्यालय परीक्षा समिति (BSEB) के छात्रों के लिए समर्पित परीक्षा तैयारी मंच।
            100% वस्तुनिष्ठ प्रश्नों का वास्तविक परीक्षा जैसा वातावरण, त्वरित परिणाम और AI गुरु का मार्गदर्शन।
          </p>

          {/* Quick Actions inside Hero */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            {classTests.length > 0 && (
              <button
                onClick={() => startTest(classTests[0])}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-lg shadow-orange-950/30 flex items-center gap-2 transition"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>डेमो महामॉक टेस्ट दें</span>
              </button>
            )}

            <button
              onClick={() => setCurrentView('ai-assistant')}
              className="bg-white/15 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm px-4 py-3 rounded-xl border border-white/20 flex items-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>AI गुरु से पूछें</span>
            </button>

            <button
              onClick={() => setCurrentView('categories')}
              className="text-xs sm:text-sm text-blue-200 hover:text-white underline underline-offset-4 px-2 py-1 transition"
            >
              सिलेबस व पैटर्न देखें
            </button>
          </div>
        </div>
      </section>

      {/* Category Selection Tabs / Badges */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-900" />
            <span>परीक्षा श्रेणी चुनें (Exam Category):</span>
          </h2>
          <button
            onClick={() => setCurrentView('categories')}
            className="text-xs font-semibold text-blue-900 hover:text-blue-700 flex items-center gap-0.5"
          >
            <span>विस्तार से देखें</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {EXAM_CATEGORIES.map((cat) => {
            const isSelected = selectedClassId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedClassId(cat.id)}
                className={`text-left p-3 rounded-2xl border transition-all relative ${
                  isSelected
                    ? 'bg-blue-900 text-white border-blue-950 shadow-md ring-2 ring-orange-500/50'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider block mb-1.5 w-fit ${
                    isSelected ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {cat.badge}
                </span>
                <div className="font-bold text-xs sm:text-sm leading-snug line-clamp-1">
                  {cat.titleHi.split('(')[0].trim()}
                </div>
                <div
                  className={`text-[11px] mt-0.5 truncate ${
                    isSelected ? 'text-blue-200' : 'text-slate-500'
                  }`}
                >
                  {cat.titleEn.split('(')[0]}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Continue Last Test / Recent Result Card */}
      {latestAttempt && (
        <section className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-orange-800 uppercase tracking-wide">
                हालिया टेस्ट परिणाम (Recent Result)
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                {latestAttempt.testTitle}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                स्कोर: <strong className="text-slate-900">{latestAttempt.score}/{latestAttempt.maxScore}</strong> ({latestAttempt.percentage}%) • सटीकता: {latestAttempt.accuracy}%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                setActiveAttempt(latestAttempt);
                setCurrentView('results');
              }}
              className="flex-1 sm:flex-initial bg-white hover:bg-orange-100/50 text-orange-900 border border-orange-300 font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-xs text-center"
            >
              विस्तृत उत्तरमाला देखें
            </button>
            {latestAttempt.incorrectCount > 0 && (
              <button
                onClick={() => {
                  setActiveAttempt(latestAttempt);
                  setCurrentView('results');
                }}
                className="flex-1 sm:flex-initial bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-xs flex items-center justify-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>गलत प्रश्न सुधारें</span>
              </button>
            )}
          </div>
        </section>
      )}

      {/* Main Tests Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-900" />
              <span>उपलब्ध टेस्ट एवं क्विज़ ({filteredTests.length})</span>
            </h2>
            <p className="text-xs text-slate-500">
              बिहार बोर्ड {selectedCategory.titleHi} के लिए डेमो अभ्यास टेस्ट
            </p>
          </div>

          {/* Test Type Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                activeTab === 'all'
                  ? 'bg-white text-blue-950 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              सभी टेस्ट
            </button>
            <button
              onClick={() => setActiveTab('mock')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                activeTab === 'mock'
                  ? 'bg-blue-900 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-blue-900'
              }`}
            >
              सम्पूर्ण मॉक (Mock)
            </button>
            <button
              onClick={() => setActiveTab('chapter')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                activeTab === 'chapter'
                  ? 'bg-blue-900 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-blue-900'
              }`}
            >
              अध्यायवार (Chapter)
            </button>
            <button
              onClick={() => setActiveTab('daily')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                activeTab === 'daily'
                  ? 'bg-blue-900 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-blue-900'
              }`}
            >
              दैनिक बूस्टर (Daily)
            </button>
          </div>
        </div>

        {/* Tests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTests.map((test) => (
            <div
              key={test.id}
              className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 border border-blue-200">
                      {test.type === 'mock'
                        ? 'मॉक टेस्ट'
                        : test.type === 'chapter'
                        ? 'अध्याय क्विज़'
                        : 'दैनिक बूस्टर'}
                    </span>
                    <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
                      डेमो अभ्यास
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">{test.syllabusYear}</span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-900 transition leading-snug">
                  {test.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{test.subTitle}</p>

                {/* Details Row */}
                <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-blue-900" />
                    <span>{test.durationMinutes} मिनट</span>
                  </div>
                  <div className="flex items-center gap-1 font-medium">
                    <BookOpen className="w-3.5 h-3.5 text-blue-900" />
                    <span>{test.totalQuestions} प्रश्न</span>
                  </div>
                  <div className="flex items-center gap-1 font-medium text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>+{test.marksPerQuestion || 1.0} अंक (0 निगेटिव)</span>
                  </div>
                </div>
              </div>

              {/* Start Test Button */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium truncate max-w-[150px]">
                  {test.verificationStatus}
                </span>
                <button
                  onClick={() => startTest(test)}
                  className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl flex items-center gap-1.5 transition shadow-xs"
                >
                  <span>टेस्ट शुरू करें</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Subject Quick Access Grid */}
      <section className="bg-slate-50 rounded-3xl p-5 sm:p-6 border border-slate-200/80 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              विषयवार अध्याय व क्विज़ (Subjects)
            </h2>
            <p className="text-xs text-slate-500">
              गणित, विज्ञान, सामाजिक विज्ञान, हिंदी एवं संस्कृत का अध्यायवार अध्ययन
            </p>
          </div>
          <button
            onClick={() => setCurrentView('subjects')}
            className="text-xs font-semibold text-blue-900 hover:underline flex items-center gap-1"
          >
            <span>सभी विषय</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {SUBJECTS_CLASS_10.map((subj) => (
            <button
              key={subj.id}
              onClick={() => {
                setSelectedSubjectId(subj.id);
                setCurrentView('subjects');
              }}
              className="bg-white p-3.5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition text-left group"
            >
              <div className="text-xs font-bold text-blue-950 group-hover:text-blue-900 truncate">
                {subj.nameHi}
              </div>
              <div className="text-[11px] text-slate-500 truncate">{subj.nameEn}</div>
              <div className="text-[10px] text-orange-700 bg-orange-50 font-semibold px-2 py-0.5 rounded-md mt-2 w-fit">
                {subj.chapters.length} अध्याय
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* AI Guru Study Assistant Teaser Card */}
      <section className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI गुरु: 24/7 शंका समाधान व रिवीजन</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            गणित के सूत्र या विज्ञान का कोई सिद्धांत समझ नहीं आ रहा?
          </h2>
          <p className="text-xs sm:text-sm text-orange-100 max-w-xl">
            बिहार बोर्ड के छात्र अब किसी भी प्रश्न का सरल हिंदी में हल, महत्वपूर्ण परीक्षा टिप्स और
            चैप्टर समरी सीधे AI गुरु से प्राप्त कर सकते हैं।
          </p>
        </div>

        <button
          onClick={() => setCurrentView('ai-assistant')}
          className="shrink-0 bg-blue-950 hover:bg-blue-900 text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-xl transition flex items-center gap-2"
        >
          <span>AI गुरु से बात करें</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>
    </div>
  );
};
