import React, { useState } from 'react';
import { useExam } from '../context/ExamContext';
import { Bookmark, BookmarkCheck, Trash2, Play, BookOpen, AlertCircle } from 'lucide-react';
import { TestModel } from '../types';

export const BookmarksView: React.FC = () => {
  const { bookmarks, toggleBookmark, startTest, setCurrentView } = useExam();
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');

  const filteredBookmarks = bookmarks.filter((b) => {
    if (selectedSubjectFilter === 'all') return true;
    return b.question.subjectId === selectedSubjectFilter;
  });

  const handleStartRevisionFromBookmarks = () => {
    if (filteredBookmarks.length === 0) return;

    const revisionQuestions = filteredBookmarks.map((b) => b.question);
    const revisionTest: TestModel = {
      id: `bm-test-${Date.now()}`,
      title: 'सहेजे गए प्रश्नों का त्वरित रिवीजन टेस्ट',
      subTitle: `आपके द्वारा बुकमार्क किए गए ${revisionQuestions.length} महत्वपूर्ण प्रश्नों का अभ्यास`,
      type: 'mock',
      classId: revisionQuestions[0].classId,
      subjectId: 'bookmarked-revision',
      subjectNameHi: 'सहेजे गए प्रश्न (Revision)',
      durationMinutes: Math.max(5, Math.ceil(revisionQuestions.length * 1.5)),
      totalQuestions: revisionQuestions.length,
      marksPerQuestion: 1.0,
      negativeMarksPerQuestion: 0.0,
      passingPercentage: 60,
      syllabusYear: '2025-2026',
      verificationStatus: 'व्यक्तिगत बुकमार्क संग्रह',
      isDemoPractice: true,
      isPublished: true,
      instructions: [
        'यह टेस्ट आपके द्वारा पहले सहेजे गए प्रश्नों पर आधारित है।',
        'अपने संदेह दूर करें और पूर्ण सटीकता प्राप्त करने का लक्ष्य रखें।',
      ],
      questions: revisionQuestions,
      createdAt: new Date().toISOString(),
    };

    startTest(revisionTest);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-orange-600 mb-1">
            <BookmarkCheck className="w-4 h-4 text-orange-600" />
            <span>सहेजे गए प्रश्न (Bookmarks / Revision List)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            महत्वपूर्ण प्रश्नों का व्यक्तिगत संग्रह ({bookmarks.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            जिन प्रश्नों में आपको कठिनाई हुई थी, उन्हें परीक्षा पूर्व त्वरित रिवीजन हेतु यहाँ सहेजें।
          </p>
        </div>

        {bookmarks.length > 0 && (
          <button
            onClick={handleStartRevisionFromBookmarks}
            className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow-xs shrink-0"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>रिवीजन टेस्ट दें ({filteredBookmarks.length})</span>
          </button>
        )}
      </div>

      {bookmarks.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-3">
          <Bookmark className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">अभी कोई प्रश्न सहेजा नहीं गया है</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            मॉक टेस्ट या परिणाम देखते समय प्रश्न के ऊपर दिए गए 'सहेजें' बटन पर क्लिक करके आप किसी
            भी कठिन प्रश्न को यहाँ जोड़ सकते हैं।
          </p>
          <button
            onClick={() => setCurrentView('home')}
            className="bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition"
          >
            होम डैशबोर्ड पर जाएं
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookmarks.map((item, idx) => {
            const q = item.question;
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-900 text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-700">
                      {q.topicTag || 'सामान्य'}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleBookmark(q)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition"
                    title="बुकमार्क हटाएं"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-sm font-semibold text-slate-900 leading-snug">
                  {q.questionText}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {q.options.map((opt, oIdx) => {
                    const isRight = oIdx === q.correctOptionIndex;
                    return (
                      <div
                        key={oIdx}
                        className={`p-2 rounded-lg border flex items-center gap-2 ${
                          isRight
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-medium'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className="font-bold text-[10px]">{String.fromCharCode(65 + oIdx)}.</span>
                        <span>{opt}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-xs text-slate-600 space-y-1">
                  <div className="font-bold text-slate-800">सही उत्तर व समाधान:</div>
                  <div className="whitespace-pre-line">{q.explanation}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
