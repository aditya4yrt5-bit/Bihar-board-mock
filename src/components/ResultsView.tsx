import React, { useState, useEffect } from 'react';
import { useExam } from '../context/ExamContext';
import { TestAttempt, Question } from '../types';
import confetti from 'canvas-confetti';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Target,
  BarChart3,
  Award,
  BookOpen,
  Share2,
  Loader2,
  HelpCircle,
} from 'lucide-react';

import { StudentProgressChart } from './StudentProgressChart';

export const ResultsView: React.FC = () => {
  const {
    activeAttempt,
    testHistory,
    tests,
    setCurrentView,
    retryWrongQuestions,
    toggleBookmark,
    isBookmarked,
  } = useExam();

  const [aiExplanations, setAiExplanations] = useState<Record<string, string>>({});
  const [loadingAiForQuestion, setLoadingAiForQuestion] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'incorrect' | 'correct' | 'skipped'>('all');
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  useEffect(() => {
    // Trigger confetti if scored 60% or more
    if (activeAttempt && activeAttempt.percentage >= 60) {
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Ignore in unsupported environments
      }
    }
  }, [activeAttempt]);

  if (!activeAttempt) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-2">कोई परिणाम उपलब्ध नहीं है</h2>
        <button
          onClick={() => setCurrentView('home')}
          className="bg-blue-900 text-white px-5 py-2.5 rounded-xl font-semibold"
        >
          डैशबोर्ड पर लौटें
        </button>
      </div>
    );
  }

  const originalTest = tests.find((t) => t.id === activeAttempt.testId);
  const questions: Question[] = originalTest ? originalTest.questions : [];

  const handleFetchAiExplanation = async (q: Question) => {
    setLoadingAiForQuestion(q.id);
    try {
      const res = await fetch('/api/gemini/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: q.questionText,
          options: q.options,
          selectedOption:
            activeAttempt.answers[q.id] !== undefined
              ? q.options[activeAttempt.answers[q.id]]
              : 'हल नहीं किया',
          correctOption: q.options[q.correctOptionIndex],
          subject: originalTest?.subjectNameHi || 'सामान्य',
          chapter: q.topicTag,
          classLevel: activeAttempt.classId,
        }),
      });

      const data = await res.json();
      if (data.explanation) {
        setAiExplanations((prev) => ({
          ...prev,
          [q.id]: data.explanation,
        }));
      } else {
        setAiExplanations((prev) => ({
          ...prev,
          [q.id]: q.explanation || 'व्याख्या उपलब्ध नहीं है।',
        }));
      }
    } catch (err) {
      console.error('Error fetching AI explanation:', err);
      setAiExplanations((prev) => ({
        ...prev,
        [q.id]: q.explanation || 'ऑफ़लाइन व्याख्या: ' + q.explanation,
      }));
    } finally {
      setLoadingAiForQuestion(null);
    }
  };

  // Filtered review questions
  const filteredQuestions = questions.filter((q) => {
    const userAnswer = activeAttempt.answers[q.id];
    if (filterMode === 'correct') return userAnswer === q.correctOptionIndex;
    if (filterMode === 'incorrect')
      return userAnswer !== undefined && userAnswer !== q.correctOptionIndex;
    if (filterMode === 'skipped') return userAnswer === undefined;
    return true;
  });

  const avgTimePerQuestion =
    questions.length > 0
      ? Math.round(activeAttempt.timeSpentSeconds / questions.length)
      : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Top Banner & Grade */}
      <div className="bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-32 h-32 bg-blue-400/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-400/30 text-xs font-semibold">
              <Award className="w-3.5 h-3.5" />
              <span>
                {activeAttempt.percentage >= 80
                  ? 'उत्कृष्ट प्रदर्शन! (Top Grade)'
                  : activeAttempt.percentage >= 60
                  ? 'प्रथम श्रेणी (1st Division)'
                  : activeAttempt.percentage >= 45
                  ? 'द्वितीय श्रेणी (2nd Division)'
                  : 'और अधिक अभ्यास की आवश्यकता'}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white">
              परीक्षण परिणाम पत्र (Test Report Card)
            </h1>
            <p className="text-xs sm:text-sm text-blue-200">{activeAttempt.testTitle}</p>
          </div>

          {/* Big Score Medallion */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 min-w-[140px]">
            <div className="text-3xl sm:text-4xl font-extrabold text-amber-300 tracking-tight">
              {activeAttempt.score}
              <span className="text-lg text-white/70 font-medium">/{activeAttempt.maxScore}</span>
            </div>
            <div className="text-xs font-semibold text-blue-100 mt-1">
              प्रतिशत: {activeAttempt.percentage}%
            </div>
          </div>
        </div>

        {/* 4 Quick Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/15 text-center">
          <div className="bg-white/5 rounded-xl p-2.5">
            <div className="text-xs text-blue-200">सही उत्तर (Correct)</div>
            <div className="text-lg font-bold text-emerald-400 mt-0.5">
              {activeAttempt.correctCount}
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-2.5">
            <div className="text-xs text-blue-200">गलत उत्तर (Incorrect)</div>
            <div className="text-lg font-bold text-rose-400 mt-0.5">
              {activeAttempt.incorrectCount}
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-2.5">
            <div className="text-xs text-blue-200">सटीकता (Accuracy)</div>
            <div className="text-lg font-bold text-amber-300 mt-0.5">
              {activeAttempt.accuracy}%
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-2.5">
            <div className="text-xs text-blue-200">औसत समय प्रति प्रश्न</div>
            <div className="text-lg font-bold text-white mt-0.5">{avgTimePerQuestion}s</div>
          </div>
        </div>
      </div>

      {/* Action Buttons: Retry Wrong Questions / New Test */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {activeAttempt.incorrectCount > 0 ? (
          <button
            onClick={() => retryWrongQuestions(activeAttempt)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm px-5 py-3 rounded-xl shadow-md transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>गलत प्रश्नों का पुनः अभ्यास ({activeAttempt.incorrectCount})</span>
          </button>
        ) : (
          <div className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
            शाबाश! आपने सभी प्रश्नों के सही उत्तर दिए हैं।
          </div>
        )}

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setCurrentView('ai-assistant')}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-xs sm:text-sm font-semibold px-4 py-3 rounded-xl transition"
          >
            <Sparkles className="w-4 h-4 text-orange-600" />
            <span>AI गुरु से कमजोरी समझें</span>
          </button>

          <button
            onClick={() => setCurrentView('home')}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold px-4 py-3 rounded-xl transition"
          >
            <span>होम डैशबोर्ड</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Chart using Recharts across Subjects Over Time */}
      <StudentProgressChart testHistory={testHistory} currentAttempt={activeAttempt} />

      {/* Topic-Wise Performance Section */}
      {activeAttempt.topicBreakdown && activeAttempt.topicBreakdown.length > 0 && (
        <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-blue-900" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              विषय/अध्याय वार विश्लेषण (Topic Breakdown)
            </h2>
          </div>

          <div className="space-y-3">
            {activeAttempt.topicBreakdown.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-slate-700">
                  <span className="truncate max-w-[200px] sm:max-w-md">{item.topic}</span>
                  <span className="shrink-0 font-bold">
                    {item.correct}/{item.total} सही ({item.accuracy}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${item.accuracy}%` }}
                    className={`h-full ${
                      item.accuracy >= 70
                        ? 'bg-emerald-500'
                        : item.accuracy >= 40
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Question Review Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              प्रश्नों की विस्तृत समीक्षा व उत्तरमाला
            </h2>
            <p className="text-xs text-slate-500">
              प्रत्येक प्रश्न का सही विकल्प, आपकी प्रतिक्रिया और प्रामाणिक व्याख्या
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded-lg transition ${
                filterMode === 'all'
                  ? 'bg-white text-blue-950 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              सभी ({questions.length})
            </button>
            <button
              onClick={() => setFilterMode('incorrect')}
              className={`px-2.5 py-1 rounded-lg transition ${
                filterMode === 'incorrect'
                  ? 'bg-rose-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-rose-600'
              }`}
            >
              गलत ({activeAttempt.incorrectCount})
            </button>
            <button
              onClick={() => setFilterMode('correct')}
              className={`px-2.5 py-1 rounded-lg transition ${
                filterMode === 'correct'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              सही ({activeAttempt.correctCount})
            </button>
            <button
              onClick={() => setFilterMode('skipped')}
              className={`px-2.5 py-1 rounded-lg transition ${
                filterMode === 'skipped'
                  ? 'bg-slate-700 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              छोड़े गए ({activeAttempt.unansweredCount})
            </button>
          </div>
        </div>

        {/* List of Questions */}
        <div className="space-y-4">
          {filteredQuestions.map((q, idx) => {
            const originalIndex = questions.findIndex((orig) => orig.id === q.id);
            const userChoice = activeAttempt.answers[q.id];
            const isCorrect = userChoice === q.correctOptionIndex;
            const isSkipped = userChoice === undefined;
            const isAiLoading = loadingAiForQuestion === q.id;
            const customAiText = aiExplanations[q.id];

            return (
              <div
                key={q.id}
                className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-xs transition ${
                  isCorrect
                    ? 'border-emerald-200'
                    : isSkipped
                    ? 'border-slate-200'
                    : 'border-rose-200'
                }`}
              >
                {/* Header row of question */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                        isCorrect
                          ? 'bg-emerald-100 text-emerald-800'
                          : isSkipped
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {originalIndex + 1}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        isCorrect
                          ? 'bg-emerald-50 text-emerald-700'
                          : isSkipped
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {isCorrect ? 'सही (+1.0)' : isSkipped ? 'छोड़ दिया (0.0)' : 'गलत (0.0)'}
                    </span>
                    <span className="text-[11px] text-slate-500 hidden sm:inline">
                      {q.topicTag || 'सामान्य'}
                    </span>
                  </div>

                  {/* Bookmark Button */}
                  <button
                    onClick={() => toggleBookmark(q, activeAttempt.testTitle)}
                    className={`p-1.5 rounded-lg border text-xs transition flex items-center gap-1 ${
                      isBookmarked(q.id)
                        ? 'bg-amber-50 text-amber-700 border-amber-300'
                        : 'bg-white text-slate-400 border-slate-200 hover:text-slate-600'
                    }`}
                    title={isBookmarked(q.id) ? 'सहेजा गया' : 'रिवीजन हेतु सहेजें'}
                  >
                    {isBookmarked(q.id) ? (
                      <BookmarkCheck className="w-3.5 h-3.5" />
                    ) : (
                      <Bookmark className="w-3.5 h-3.5" />
                    )}
                    <span className="hidden xs:inline text-[11px]">
                      {isBookmarked(q.id) ? 'सहेजा' : 'सहेजें'}
                    </span>
                  </button>
                </div>

                {/* Question Text */}
                <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-3 leading-relaxed">
                  {q.questionText}
                </h3>

                {/* Options Review */}
                <div className="space-y-2 mb-4">
                  {q.options.map((opt, optIdx) => {
                    const isRightOption = optIdx === q.correctOptionIndex;
                    const isUserChoice = optIdx === userChoice;
                    const letter = String.fromCharCode(65 + optIdx);

                    let optionBg = 'bg-slate-50 border-slate-200 text-slate-800';
                    if (isRightOption) {
                      optionBg = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-medium';
                    } else if (isUserChoice && !isRightOption) {
                      optionBg = 'bg-rose-50 border-rose-400 text-rose-950';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-2.5 sm:p-3 rounded-xl border text-xs sm:text-sm flex items-center justify-between gap-2 ${optionBg}`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-6 h-6 rounded-md text-[11px] font-bold flex items-center justify-center shrink-0 ${
                              isRightOption
                                ? 'bg-emerald-600 text-white'
                                : isUserChoice
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {letter}
                          </span>
                          <span>{opt}</span>
                        </div>

                        {/* Status Label */}
                        <div className="text-[11px] font-bold shrink-0">
                          {isRightOption && (
                            <span className="text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span className="hidden xs:inline">सही उत्तर</span>
                            </span>
                          )}
                          {isUserChoice && !isRightOption && (
                            <span className="text-rose-700 flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" />
                              <span className="hidden xs:inline">आपका चयन</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Step-by-Step Explanation Box */}
                <div className="bg-slate-50 rounded-xl p-3 sm:p-4 border border-slate-200 text-xs sm:text-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-blue-900" />
                      <span>विस्तृत समाधान व व्याख्या:</span>
                    </span>

                    {/* Ask AI Guru button */}
                    <button
                      onClick={() => handleFetchAiExplanation(q)}
                      disabled={isAiLoading}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-700 hover:text-orange-800 bg-orange-100 hover:bg-orange-200 px-2.5 py-1 rounded-lg transition disabled:opacity-50"
                      title="AI गुरु से सरल व्याख्या और बोर्ड टिप्स प्राप्त करें"
                    >
                      {isAiLoading ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>AI सोच रहा है...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 text-orange-600" />
                          <span>AI गुरु से समझें</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Standard or AI Explanation Content */}
                  <div className="text-slate-700 leading-relaxed whitespace-pre-line">
                    {customAiText || q.explanation}
                  </div>

                  {/* Source Provenance Info */}
                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
                    <span>स्रोत: {q.source}</span>
                    <span>सत्र: {q.syllabusYear}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
