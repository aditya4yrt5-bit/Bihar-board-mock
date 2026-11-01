import React, { useState, useEffect, useRef } from 'react';
import { useExam } from '../context/ExamContext';
import {
  Question,
  TestModel,
  TestAttempt,
  QuestionNavStatus,
} from '../types';
import {
  calculateScore,
  getQuestionPaletteStatus,
  formatTimeRemaining,
} from '../utils/examEngine';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Flag,
  Send,
  Eye,
  Menu,
  X,
  Languages,
} from 'lucide-react';

export const TestPlayer: React.FC = () => {
  const {
    activeTest,
    setActiveTest,
    recordTestAttempt,
    setCurrentView,
    toggleBookmark,
    isBookmarked,
  } = useExam();

  if (!activeTest || !activeTest.questions || activeTest.questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full text-center shadow-lg border border-slate-200">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 mb-2">कोई सक्रिय टेस्ट नहीं मिला</h2>
          <p className="text-sm text-slate-600 mb-4">
            कृपया डैशबोर्ड या विषय सूची से टेस्ट चुनें।
          </p>
          <button
            onClick={() => setCurrentView('home')}
            className="w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold py-2.5 rounded-xl transition"
          >
            होम डैशबोर्ड पर जाएं
          </button>
        </div>
      </div>
    );
  }

  const questions = activeTest.questions;
  const totalQuestions = questions.length;
  const initialDurationSeconds = (activeTest.durationMinutes || 15) * 60;

  // Local state
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [visitedQuestions, setVisitedQuestions] = useState<Record<string, boolean>>({
    [questions[0].id]: true,
  });
  const [secondsRemaining, setSecondsRemaining] = useState<number>(initialDurationSeconds);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState<boolean>(false);
  const [showEnglishText, setShowEnglishText] = useState<boolean>(false);
  const [paletteFilter, setPaletteFilter] = useState<'all' | 'answered' | 'unanswered' | 'marked'>('all');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<any>(null);

  const currentQuestion: Question = questions[currentIndex];

  // Mark current question as visited
  useEffect(() => {
    if (currentQuestion) {
      setVisitedQuestions((prev) => ({
        ...prev,
        [currentQuestion.id]: true,
      }));
    }
  }, [currentIndex, currentQuestion]);

  // Countdown timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleFinalSubmit(true); // Auto-submit when time expires
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Answer selection handler
  const handleSelectOption = (optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }));
  };

  // Clear answer
  const handleClearResponse = () => {
    setAnswers((prev) => {
      const updated = { ...prev };
      delete updated[currentQuestion.id];
      return updated;
    });
  };

  // Toggle Mark for Review
  const handleToggleMarkForReview = () => {
    setMarkedForReview((prev) => ({
      ...prev,
      [currentQuestion.id]: !prev[currentQuestion.id],
    }));
  };

  // Navigation handlers
  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSaveAndNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsSubmitModalOpen(true);
    }
  };

  const handleMarkAndNext = () => {
    setMarkedForReview((prev) => ({
      ...prev,
      [currentQuestion.id]: true,
    }));
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsSubmitModalOpen(true);
    }
  };

  // Final submit
  const handleFinalSubmit = (isTimeExpired = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const timeSpentSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    const scoreResult = calculateScore(
      questions,
      answers,
      activeTest.marksPerQuestion || 1.0,
      activeTest.negativeMarksPerQuestion || 0.0
    );

    const attempt: TestAttempt = {
      id: `attempt-${Date.now()}`,
      testId: activeTest.id,
      testTitle: activeTest.title,
      classId: activeTest.classId,
      subjectId: activeTest.subjectId,
      subjectNameHi: activeTest.subjectNameHi,
      startTime: new Date(startTimeRef.current).toISOString(),
      completedTime: new Date().toISOString(),
      timeSpentSeconds,
      totalQuestions,
      answers,
      markedForReview,
      score: scoreResult.score,
      maxScore: scoreResult.maxScore,
      percentage: scoreResult.percentage,
      correctCount: scoreResult.correctCount,
      incorrectCount: scoreResult.incorrectCount,
      unansweredCount: scoreResult.unansweredCount,
      accuracy: scoreResult.accuracy,
      topicBreakdown: scoreResult.topicBreakdown,
      wrongQuestionIds: scoreResult.wrongQuestionIds,
      isDemoResult: true,
    };

    recordTestAttempt(attempt);
    setCurrentView('results');
  };

  // Counts for submission summary
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = totalQuestions - answeredCount;
  const markedCount = Object.values(markedForReview).filter(Boolean).length;
  const isTimeLow = secondsRemaining <= 300; // < 5 mins

  // Filtered question palette indices
  const filteredIndices = questions
    .map((q, idx) => ({ q, idx }))
    .filter(({ q }) => {
      const status = getQuestionPaletteStatus(q.id, answers, markedForReview, visitedQuestions);
      if (paletteFilter === 'answered') return status === 'answered' || status === 'answered-marked';
      if (paletteFilter === 'unanswered') return status === 'not-answered' || status === 'not-visited';
      if (paletteFilter === 'marked') return status === 'marked-review' || status === 'answered-marked';
      return true;
    });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans select-none">
      {/* Test Player Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-3 sm:px-6 py-2.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Test Name & Class */}
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-900 shrink-0">
              {activeTest.isDemoPractice ? 'डेमो अभ्यास' : 'लाइव टेस्ट'}
            </span>
            <h1 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
              {activeTest.title}
            </h1>
          </div>

          {/* Right Header: Timer, Bilingual toggle & Submit CTA */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Language toggle if English available */}
            {currentQuestion.questionTextEn && (
              <button
                onClick={() => setShowEnglishText(!showEnglishText)}
                className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border font-medium transition ${
                  showEnglishText
                    ? 'bg-blue-50 text-blue-800 border-blue-300'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
                title="हिंदी / English भाषा बदलें"
              >
                <Languages className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden xs:inline">{showEnglishText ? 'हिन्दी में देखें' : 'English'}</span>
              </button>
            )}

            {/* Countdown Timer with Warning Color */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono font-bold text-xs sm:text-sm border transition-colors ${
                isTimeLow
                  ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                  : 'bg-slate-900 text-amber-400 border-slate-800'
              }`}
            >
              <Clock className={`w-3.5 h-3.5 ${isTimeLow ? 'text-rose-600' : 'text-amber-400'}`} />
              <span>{formatTimeRemaining(secondsRemaining)}</span>
            </div>

            {/* Palette Drawer Toggle for Mobile */}
            <button
              onClick={() => setIsPaletteOpen(true)}
              className="lg:hidden p-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1 text-xs font-semibold"
              title="प्रश्न पैलेट"
            >
              <Eye className="w-4 h-4 text-blue-900" />
              <span>{currentIndex + 1}/{totalQuestions}</span>
            </button>

            {/* Submit CTA */}
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-3.5 py-1.5 rounded-lg shadow-xs flex items-center gap-1 transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>सबमिट</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body: Two-Column on Desktop (Question Content + Palette) */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col lg:flex-row gap-4">
        {/* Left Column: Active Question Container */}
        <main className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Question Subheader */}
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-blue-900 text-white font-bold text-sm flex items-center justify-center">
                {currentIndex + 1}
              </span>
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  प्रश्न संख्या {currentIndex + 1} / {totalQuestions}
                </span>
                <span className="text-[11px] text-slate-500">
                  {currentQuestion.topicTag || activeTest.subjectNameHi}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Marking Scheme Badge */}
              <div className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-medium">
                अंक: +{currentQuestion.marks || activeTest.marksPerQuestion || 1.0}
                {activeTest.negativeMarksPerQuestion > 0 && (
                  <span className="text-rose-600 ml-1">
                    (-{activeTest.negativeMarksPerQuestion})
                  </span>
                )}
              </div>

              {/* Bookmark Question */}
              <button
                onClick={() => toggleBookmark(currentQuestion, activeTest.title)}
                className={`p-1.5 rounded-lg border transition ${
                  isBookmarked(currentQuestion.id)
                    ? 'bg-amber-50 text-amber-600 border-amber-300'
                    : 'bg-white text-slate-400 border-slate-200 hover:text-slate-700'
                }`}
                title={isBookmarked(currentQuestion.id) ? 'सहेजा गया' : 'बाद में रिवीजन हेतु सहेजें'}
              >
                {isBookmarked(currentQuestion.id) ? (
                  <BookmarkCheck className="w-4 h-4" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Question Text Box */}
          <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
            {/* Primary Question Text (Hindi) */}
            <div className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed mb-3">
              {currentQuestion.questionText}
            </div>

            {/* Optional English Subtitle */}
            {(showEnglishText || !currentQuestion.questionText) && currentQuestion.questionTextEn && (
              <div className="text-sm font-medium text-slate-600 italic mb-4 pl-3 border-l-2 border-blue-400">
                {currentQuestion.questionTextEn}
              </div>
            )}

            {/* Options List */}
            <div className="space-y-3 mt-6">
              {currentQuestion.options.map((option, optIdx) => {
                const isSelected = answers[currentQuestion.id] === optIdx;
                const optLetter = String.fromCharCode(65 + optIdx); // A, B, C, D
                const engOption = currentQuestion.optionsEn?.[optIdx];

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-xl border-2 transition-all flex items-start gap-3 group cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-700 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-blue-900 text-white'
                          : 'bg-slate-100 text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-900'
                      }`}
                    >
                      {optLetter}
                    </div>

                    <div className="flex-1">
                      <div
                        className={`text-sm sm:text-base leading-snug ${
                          isSelected ? 'font-semibold text-blue-950' : 'text-slate-800'
                        }`}
                      >
                        {option}
                      </div>
                      {showEnglishText && engOption && (
                        <div className="text-xs text-slate-500 mt-0.5">{engOption}</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Action Footer */}
          <footer className="bg-slate-50 border-t border-slate-200 p-3 sm:p-4 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              {/* Previous */}
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden xs:inline">पिछला</span>
              </button>

              {/* Clear Response */}
              {answers[currentQuestion.id] !== undefined && (
                <button
                  onClick={handleClearResponse}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 transition flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">उत्तर हटाएं</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Mark for Review */}
              <button
                onClick={handleMarkAndNext}
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition flex items-center gap-1 ${
                  markedForReview[currentQuestion.id]
                    ? 'bg-purple-100 text-purple-900 border-purple-300'
                    : 'bg-white text-purple-700 border-purple-200 hover:bg-purple-50'
                }`}
              >
                <Flag className="w-3.5 h-3.5 text-purple-600" />
                <span>
                  {markedForReview[currentQuestion.id] ? 'समीक्षित' : 'समीक्षा हेतु चिन्हित'}
                </span>
              </button>

              {/* Save & Next / Submit */}
              {currentIndex < totalQuestions - 1 ? (
                <button
                  onClick={handleSaveAndNext}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-900 hover:bg-blue-800 text-white flex items-center gap-1 shadow-xs transition"
                >
                  <span>सहेजें एवं अगला</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setIsSubmitModalOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 shadow-xs transition"
                >
                  <span>अंतिम सबमिट</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </footer>
        </main>

        {/* Right Column: Question Palette (Always visible on lg, Drawer on mobile) */}
        <aside
          className={`lg:w-80 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden ${
            isPaletteOpen
              ? 'fixed inset-0 z-50 p-4 bg-white m-0 rounded-none'
              : 'hidden lg:flex'
          }`}
        >
          {/* Palette Header */}
          <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                प्रश्न पैलेट (Question Palette)
              </h2>
              <span className="text-[11px] text-slate-500">
                उत्तरित: {answeredCount} | शेष: {unansweredCount}
              </span>
            </div>

            {isPaletteOpen && (
              <button
                onClick={() => setIsPaletteOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200"
                aria-label="बंद करें"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Palette Legend */}
          <div className="p-3 bg-slate-50/70 border-b border-slate-200 grid grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-emerald-600 text-white flex items-center justify-center text-[9px] font-bold">
                ✓
              </span>
              <span className="text-slate-600">उत्तर दिया ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-rose-500 text-white flex items-center justify-center text-[9px] font-bold">
                •
              </span>
              <span className="text-slate-600">उत्तर नहीं दिया ({unansweredCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-purple-600 text-white flex items-center justify-center text-[9px] font-bold">
                ?
              </span>
              <span className="text-slate-600">समीक्षा हेतु ({markedCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-slate-200 text-slate-600 flex items-center justify-center text-[9px]">
                0
              </span>
              <span className="text-slate-600">नहीं देखा</span>
            </div>
          </div>

          {/* Palette Filter Tabs */}
          <div className="p-2 border-b border-slate-200 flex gap-1 text-[11px] overflow-x-auto">
            <button
              onClick={() => setPaletteFilter('all')}
              className={`px-2 py-1 rounded-md font-medium whitespace-nowrap transition ${
                paletteFilter === 'all'
                  ? 'bg-blue-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              सभी ({totalQuestions})
            </button>
            <button
              onClick={() => setPaletteFilter('answered')}
              className={`px-2 py-1 rounded-md font-medium whitespace-nowrap transition ${
                paletteFilter === 'answered'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              उत्तरित ({answeredCount})
            </button>
            <button
              onClick={() => setPaletteFilter('unanswered')}
              className={`px-2 py-1 rounded-md font-medium whitespace-nowrap transition ${
                paletteFilter === 'unanswered'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              अनुत्तरित ({unansweredCount})
            </button>
            <button
              onClick={() => setPaletteFilter('marked')}
              className={`px-2 py-1 rounded-md font-medium whitespace-nowrap transition ${
                paletteFilter === 'marked'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              चिन्हित ({markedCount})
            </button>
          </div>

          {/* Questions Grid */}
          <div className="p-3 flex-1 overflow-y-auto">
            <div className="grid grid-cols-5 gap-2">
              {filteredIndices.map(({ q, idx }) => {
                const status = getQuestionPaletteStatus(
                  q.id,
                  answers,
                  markedForReview,
                  visitedQuestions
                );
                const isCurrent = idx === currentIndex;

                let btnClass = 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300';
                if (status === 'answered-marked') {
                  btnClass = 'bg-purple-700 text-white font-bold border-purple-900 ring-2 ring-emerald-400';
                } else if (status === 'marked-review') {
                  btnClass = 'bg-purple-600 text-white font-bold border-purple-800';
                } else if (status === 'answered') {
                  btnClass = 'bg-emerald-600 text-white font-bold border-emerald-700';
                } else if (status === 'not-answered') {
                  btnClass = 'bg-rose-500 text-white font-bold border-rose-600';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setIsPaletteOpen(false);
                    }}
                    className={`h-9 rounded-lg text-xs font-bold flex items-center justify-center border transition-all ${btnClass} ${
                      isCurrent ? 'ring-3 ring-blue-500 scale-105' : ''
                    }`}
                    title={`प्रश्न ${idx + 1}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Submit inside Palette */}
          <div className="p-3 bg-slate-50 border-t border-slate-200">
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>परीक्षा समाप्त करें (Submit Test)</span>
            </button>
          </div>
        </aside>
      </div>

      {/* Confirmation Before Submission Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="text-center mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6 text-blue-900" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                क्या आप टेस्ट सबमिट करना चाहते हैं?
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                सबमिशन के बाद आप अपने उत्तरों में संशोधन नहीं कर पाएंगे।
              </p>
            </div>

            {/* Status Summary Grid */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2 mb-4 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/70">
                <span className="text-slate-600">कुल प्रश्न:</span>
                <span className="font-bold text-slate-900">{totalQuestions}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/70">
                <span className="text-emerald-700 font-medium">उत्तर दिए गए:</span>
                <span className="font-bold text-emerald-700">{answeredCount}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/70">
                <span className="text-rose-600 font-medium">उत्तर नहीं दिए गए:</span>
                <span className="font-bold text-rose-600">{unansweredCount}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-purple-700 font-medium">समीक्षा हेतु चिन्हित:</span>
                <span className="font-bold text-purple-700">{markedCount}</span>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs p-2.5 rounded-lg mb-4 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  ध्यान दें: आपके <strong>{unansweredCount} प्रश्न</strong> अभी भी हल नहीं हुए हैं।
                  बिहार बोर्ड में निगेटिव मार्किंग नहीं है, अतः सभी प्रश्न हल करने का प्रयास करें!
                </span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition"
              >
                टेस्ट जारी रखें
              </button>
              <button
                onClick={() => handleFinalSubmit(false)}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
              >
                {isSubmitting ? 'गणना की जा रही है...' : 'हाँ, सबमिट करें'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
