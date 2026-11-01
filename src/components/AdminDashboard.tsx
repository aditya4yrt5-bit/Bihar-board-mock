import React, { useState } from 'react';
import { useExam } from '../context/ExamContext';
import { TestModel, Question, ExamClassId } from '../types';
import { EXAM_CATEGORIES, SUBJECTS_CLASS_10 } from '../data/mockData';
import { validateQuestionImport, RowValidationError } from '../utils/examEngine';
import {
  ShieldCheck,
  PlusCircle,
  FileUp,
  Download,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  BarChart,
  BookOpen,
  Check,
  FileSpreadsheet,
  Lock,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    tests,
    saveTest,
    deleteTest,
    togglePublishTest,
    importQuestionsToTest,
    startTest,
    isAdminMode,
    setIsAdminMode,
    testHistory,
    setCurrentView,
  } = useExam();

  const [adminTab, setAdminTab] = useState<'tests' | 'questions' | 'import' | 'analytics'>('tests');

  // Test editor modal state
  const [editingTest, setEditingTest] = useState<TestModel | null>(null);
  const [isCreatingTest, setIsCreatingTest] = useState<boolean>(false);

  // Question Import State
  const [targetTestIdForImport, setTargetTestIdForImport] = useState<string>(
    tests.length > 0 ? tests[0].id : ''
  );
  const [importText, setImportText] = useState<string>('');
  const [importFormat, setImportFormat] = useState<'json' | 'csv'>('json');
  const [importErrors, setImportErrors] = useState<RowValidationError[]>([]);
  const [importSuccessCount, setImportSuccessCount] = useState<number | null>(null);

  // New question form state inside question bank
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    classId: 'bseb-class-10-matric',
    subjectId: 'maths-10',
    chapterId: 'm-ch1',
    questionText: '',
    options: ['', '', '', ''],
    correctOptionIndex: 0,
    explanation: '',
    difficulty: 'आसान',
    marks: 1.0,
    negativeMarks: 0.0,
    source: 'प्रशिक्षक द्वारा रचित (Admin Verified)',
    syllabusYear: '2025-2026',
    reviewStatus: 'समीक्षित (Verified)',
    isSampleDemo: false,
    topicTag: 'गणित',
  });

  const [questionBankFilter, setQuestionBankFilter] = useState<string>('all');

  // Guard: if not admin mode, show unauthorized message
  if (!isAdminMode) {
    return (
      <div className="max-w-md mx-auto p-8 my-12 bg-white rounded-3xl border border-rose-200 text-center shadow-lg space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">एडमिन पैनल केवल अधिकृत शिक्षकों के लिए है</h2>
        <p className="text-xs text-slate-600">
          साधारण विद्यार्थी इस अनुभाग में प्रवेश नहीं कर सकते। प्रश्न पत्र तैयार करने व संपादित करने
          के लिए एडमिन मोड सक्रिय करें।
        </p>
        <button
          onClick={() => setIsAdminMode(true)}
          className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-xs"
        >
          एडमिन मोड सक्रिय करें (Demo Unlock)
        </button>
      </div>
    );
  }

  // Handle Create / Save Test
  const handleSaveTestForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTest) return;

    saveTest(editingTest);
    setEditingTest(null);
    setIsCreatingTest(false);
  };

  const handleInitNewTest = () => {
    const blankTest: TestModel = {
      id: `test-admin-${Date.now()}`,
      title: 'नया बिहार बोर्ड टेस्ट',
      subTitle: 'विशेष अभ्यास प्रश्नोत्तरी',
      type: 'mock',
      classId: 'bseb-class-10-matric',
      subjectId: 'all-subjects',
      subjectNameHi: 'सभी मुख्य विषय',
      durationMinutes: 15,
      totalQuestions: 0,
      marksPerQuestion: 1.0,
      negativeMarksPerQuestion: 0.0,
      passingPercentage: 60,
      syllabusYear: '2025-2026',
      verificationStatus: 'प्रशिक्षक द्वारा सत्यापित',
      isDemoPractice: false,
      isPublished: true,
      instructions: [
        'सभी प्रश्न अनिवार्य हैं।',
        'समय सीमा समाप्त होने पर टेस्ट स्वतः सबमिट हो जाएगा।',
      ],
      questions: [],
      createdAt: new Date().toISOString(),
    };
    setEditingTest(blankTest);
    setIsCreatingTest(true);
  };

  // Handle Question Import
  const handleRunImport = () => {
    setImportErrors([]);
    setImportSuccessCount(null);

    if (!importText.trim()) {
      setImportErrors([{ row: 1, field: 'data', message: 'कृपया आयात हेतु डेटा दर्ज करें।' }]);
      return;
    }

    let parsedList: any[] = [];
    if (importFormat === 'json') {
      try {
        parsedList = JSON.parse(importText);
        if (!Array.isArray(parsedList)) {
          parsedList = [parsedList];
        }
      } catch (err: any) {
        setImportErrors([{ row: 1, field: 'JSON', message: `अमान्य JSON प्रारूप: ${err.message}` }]);
        return;
      }
    } else {
      // CSV format parser (header: questionText,option1,option2,option3,option4,correctIndex,explanation)
      const lines = importText.split('\n').filter((l) => l.trim() !== '');
      if (lines.length <= 1) {
        setImportErrors([{ row: 1, field: 'CSV', message: 'CSV में कम से कम 1 डेटा पंक्ति होनी चाहिए।' }]);
        return;
      }

      // Skip header line
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.trim());
        if (parts.length >= 6) {
          parsedList.push({
            questionText: parts[0],
            options: [parts[1], parts[2], parts[3], parts[4]],
            correctOptionIndex: parseInt(parts[5], 10),
            explanation: parts[6] || 'व्याख्या उपलब्ध नहीं',
            difficulty: 'मध्यम',
            marks: 1.0,
            negativeMarks: 0.0,
          });
        } else {
          setImportErrors((prev) => [
            ...prev,
            { row: i + 1, field: 'CSV Columns', message: 'कॉलम संख्या 6 से कम है (Question, O1, O2, O3, O4, CorrectIdx)' },
          ]);
        }
      }
    }

    const { validQuestions, errors } = validateQuestionImport(parsedList);

    if (errors.length > 0) {
      setImportErrors(errors);
    }

    if (validQuestions.length > 0 && targetTestIdForImport) {
      importQuestionsToTest(targetTestIdForImport, validQuestions);
      setImportSuccessCount(validQuestions.length);
      setImportText('');
    }
  };

  // Sample JSON Template
  const sampleJsonTemplate = JSON.stringify(
    [
      {
        questionText: 'प्रकाश के अपवर्तन के कितने नियम हैं?',
        options: ['1 (एक)', '2 (दो)', '3 (तीन)', '4 (चार)'],
        correctOptionIndex: 1,
        explanation: 'प्रकाश के अपवर्तन के दो नियम हैं: 1. आपतित किरण, अपवर्तित किरण और अभिलंब एक ही तल में होते हैं, 2. स्नेल का नियम sin i / sin r = μ।',
        difficulty: 'आसान',
        marks: 1.0,
        negativeMarks: 0.0,
        source: 'BSEB मॉडल 2025',
        topicTag: 'प्रकाशिकी',
      },
    ],
    null,
    2
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold shadow-md">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-400/30">
                संरक्षित एडमिन पोर्टल (Admin Portal)
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black mt-1">
              बिहार एग्जाम गुरु टेस्ट व प्रश्न बैंक प्रबंधन
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              टेस्ट बनाना, संशोधित करना, CSV/JSON से प्रश्न आयात करना और उपयोगिता विश्लेषण
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAdminMode(false)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition"
          >
            विद्यार्थी मोड पर लौटें
          </button>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex gap-1 bg-slate-200/70 p-1 rounded-2xl text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setAdminTab('tests')}
          className={`px-4 py-2.5 rounded-xl transition whitespace-nowrap ${
            adminTab === 'tests'
              ? 'bg-white text-blue-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          📝 टेस्ट प्रबंधन ({tests.length})
        </button>
        <button
          onClick={() => setAdminTab('questions')}
          className={`px-4 py-2.5 rounded-xl transition whitespace-nowrap ${
            adminTab === 'questions'
              ? 'bg-white text-blue-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          📚 प्रश्न बैंक (Question Bank)
        </button>
        <button
          onClick={() => setAdminTab('import')}
          className={`px-4 py-2.5 rounded-xl transition whitespace-nowrap ${
            adminTab === 'import'
              ? 'bg-white text-blue-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          📥 CSV / JSON प्रश्न आयात
        </button>
        <button
          onClick={() => setAdminTab('analytics')}
          className={`px-4 py-2.5 rounded-xl transition whitespace-nowrap ${
            adminTab === 'analytics'
              ? 'bg-white text-blue-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          📊 उपयोगिता एनालिटिक्स
        </button>
      </div>

      {/* TAB 1: Tests Management */}
      {adminTab === 'tests' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              सक्रिय एवं प्रकाशित टेस्ट सूची
            </h2>
            <button
              onClick={handleInitNewTest}
              className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>नया टेस्ट बनाएं</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tests.map((test) => (
              <div
                key={test.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        test.isPublished
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {test.isPublished ? 'प्रकाशित (Published)' : 'ड्राफ्ट (Unpublished)'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {test.questions.length} प्रश्न • {test.durationMinutes} मिनट
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {test.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{test.subTitle}</p>

                  <div className="text-xs text-slate-600 mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span>अंकन: +{test.marksPerQuestion} / -{test.negativeMarksPerQuestion}</span>
                    <span className="truncate max-w-[150px]">{test.verificationStatus}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => togglePublishTest(test.id)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg font-semibold transition ${
                        test.isPublished
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {test.isPublished ? 'अप्रकाशित करें' : 'प्रकाशित करें'}
                    </button>

                    <button
                      onClick={() => {
                        setEditingTest(test);
                        setIsCreatingTest(false);
                      }}
                      className="text-xs px-2.5 py-1.5 rounded-lg font-semibold bg-blue-50 text-blue-900 hover:bg-blue-100 transition flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>संपादित</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startTest(test)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-900 hover:bg-blue-50 transition"
                      title="पूर्वावलोकन करें"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTest(test.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="टेस्ट हटाएं"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Question Bank Manager */}
      {adminTab === 'questions' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                केंद्रीय प्रश्न बैंक (Central Question Bank)
              </h2>
              <p className="text-xs text-slate-500">
                बिहार बोर्ड के प्रश्नों का प्रामाणिक संग्रह, उत्तर व्याख्या और स्रोत
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={questionBankFilter}
                onChange={(e) => setQuestionBankFilter(e.target.value)}
                className="text-xs font-semibold p-2 rounded-xl border border-slate-300 bg-slate-50"
              >
                <option value="all">सभी टेस्ट के प्रश्न</option>
                {tests.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title.slice(0, 30)}...
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Add Single Question Inline Accordion / Form */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4 text-blue-900" />
              <span>नया प्रश्न जोड़ें (Add Single Question):</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  प्रश्न विवरण (Question Text in Hindi):
                </label>
                <textarea
                  rows={2}
                  value={newQuestion.questionText}
                  onChange={(e) => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
                  placeholder="उदा. गोलीय दर्पण की फोकस दूरी और वक्रता त्रिज्या में क्या संबंध है?"
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[0, 1, 2, 3].map((optIdx) => (
                  <div key={optIdx}>
                    <label className="font-medium text-slate-600 block mb-1">
                      विकल्प {String.fromCharCode(65 + optIdx)}:
                    </label>
                    <input
                      type="text"
                      value={newQuestion.options?.[optIdx] || ''}
                      onChange={(e) => {
                        const opts = [...(newQuestion.options || ['', '', '', ''])];
                        opts[optIdx] = e.target.value;
                        setNewQuestion({ ...newQuestion, options: opts });
                      }}
                      placeholder={`विकल्प ${optIdx + 1}`}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">सही विकल्प:</label>
                  <select
                    value={newQuestion.correctOptionIndex}
                    onChange={(e) =>
                      setNewQuestion({ ...newQuestion, correctOptionIndex: parseInt(e.target.value, 10) })
                    }
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white font-bold"
                  >
                    <option value={0}>विकल्प A</option>
                    <option value={1}>विकल्प B</option>
                    <option value={2}>विकल्प C</option>
                    <option value={3}>विकल्प D</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">अंक (+Marks):</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newQuestion.marks}
                    onChange={(e) =>
                      setNewQuestion({ ...newQuestion, marks: parseFloat(e.target.value) || 1.0 })
                    }
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    ऋणात्मक अंक (-Negative):
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    value={newQuestion.negativeMarks}
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        negativeMarks: parseFloat(e.target.value) || 0.0,
                      })
                    }
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  चरणबद्ध व्याख्या (Explanation in Hindi):
                </label>
                <textarea
                  rows={2}
                  value={newQuestion.explanation}
                  onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                  placeholder="हल का तर्क व सूत्र..."
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!newQuestion.questionText) return;
                    const testId = targetTestIdForImport || tests[0]?.id;
                    if (!testId) return;

                    const formattedQ: Question = {
                      id: `q-cust-${Date.now()}`,
                      classId: 'bseb-class-10-matric',
                      subjectId: 'maths-10',
                      chapterId: 'm-ch1',
                      language: 'hi',
                      questionText: newQuestion.questionText,
                      options: newQuestion.options || ['A', 'B', 'C', 'D'],
                      correctOptionIndex: newQuestion.correctOptionIndex || 0,
                      explanation: newQuestion.explanation || 'व्याख्या उपलब्ध नहीं',
                      difficulty: 'आसान',
                      marks: newQuestion.marks || 1.0,
                      negativeMarks: newQuestion.negativeMarks || 0.0,
                      source: 'शिक्षक द्वारा जोड़ा गया (Custom Question)',
                      syllabusYear: '2025-2026',
                      reviewStatus: 'समीक्षित (Verified)',
                      isSampleDemo: false,
                      topicTag: 'कस्टम',
                    };

                    importQuestionsToTest(testId, [formattedQ]);
                    alert('प्रश्न सफलतापूर्वक टेस्ट में जोड़ दिया गया!');
                    setNewQuestion({
                      ...newQuestion,
                      questionText: '',
                      explanation: '',
                    });
                  }}
                  className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-4 py-2 rounded-xl transition"
                >
                  प्रश्न सहेजें
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CSV / JSON Question Import */}
      {adminTab === 'import' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              प्रश्नों का सामूहिक आयात (Bulk Question Import)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              वैध JSON या CSV प्रारूप से सैकड़ों प्रश्नों को सीधे किसी टेस्ट में आयात करें।
              प्रत्येक पंक्ति का स्वतः सत्यापन किया जाएगा।
            </p>
          </div>

          {/* Target Test Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                आयात हेतु लक्ष्य टेस्ट (Target Test):
              </label>
              <select
                value={targetTestIdForImport}
                onChange={(e) => setTargetTestIdForImport(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-medium"
              >
                {tests.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.questions.length} प्रश्न)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">आयात प्रारूप (Format):</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setImportFormat('json')}
                  className={`flex-1 py-2 rounded-xl font-bold border transition ${
                    importFormat === 'json'
                      ? 'bg-blue-900 text-white border-blue-950'
                      : 'bg-slate-50 text-slate-700 border-slate-300'
                  }`}
                >
                  JSON प्रारूप
                </button>
                <button
                  type="button"
                  onClick={() => setImportFormat('csv')}
                  className={`flex-1 py-2 rounded-xl font-bold border transition ${
                    importFormat === 'csv'
                      ? 'bg-blue-900 text-white border-blue-950'
                      : 'bg-slate-50 text-slate-700 border-slate-300'
                  }`}
                >
                  CSV प्रारूप
                </button>
              </div>
            </div>
          </div>

          {/* Text Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5 text-xs">
              <label className="font-bold text-slate-700">
                {importFormat === 'json' ? 'JSON डेटा पेस्ट करें:' : 'CSV डेटा पेस्ट करें:'}
              </label>
              <button
                type="button"
                onClick={() => setImportText(sampleJsonTemplate)}
                className="text-blue-900 font-semibold hover:underline"
              >
                नमूना टेम्पलेट भरें
              </button>
            </div>
            <textarea
              rows={8}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={
                importFormat === 'json'
                  ? sampleJsonTemplate
                  : 'questionText,option1,option2,option3,option4,correctIndex,explanation\nप्रकाश के अपवर्तन के कितने नियम हैं?,1,2,3,4,1,दो नियम हैं'
              }
              className="w-full font-mono text-xs p-3 rounded-2xl border border-slate-300 bg-slate-50 text-slate-900"
            />
          </div>

          {/* Validation & Errors Output */}
          {importErrors.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs space-y-2">
              <div className="font-bold text-rose-800 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>पंक्ति-वार त्रुटियां पाई गईं ({importErrors.length}):</span>
              </div>
              <ul className="space-y-1 list-disc list-inside text-rose-700">
                {importErrors.map((err, i) => (
                  <li key={i}>
                    <strong>पंक्ति {err.row} ({err.field}):</strong> {err.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {importSuccessCount !== null && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                सफलता! कुल <strong>{importSuccessCount} प्रश्न</strong> सफलतापूर्वक टेस्ट में जोड़
                दिए गए हैं।
              </span>
            </div>
          )}

          {/* Submit Import Action */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => {
                setImportText('');
                setImportErrors([]);
              }}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700"
            >
              साफ़ करें
            </button>
            <button
              onClick={handleRunImport}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
            >
              <FileUp className="w-4 h-4" />
              <span>सत्यापित करें एवं आयात करें</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: Analytics */}
      {adminTab === 'analytics' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-slate-900">उपयोगिता एवं प्रदर्शन मैट्रिक्स</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
              <div className="text-2xl font-black text-blue-950">{tests.length}</div>
              <div className="text-xs text-slate-500 mt-1">कुल टेस्ट निर्मित</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
              <div className="text-2xl font-black text-emerald-700">
                {tests.reduce((acc, t) => acc + t.questions.length, 0)}
              </div>
              <div className="text-xs text-slate-500 mt-1">कुल प्रश्न बैंक आकार</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
              <div className="text-2xl font-black text-orange-600">{testHistory.length}</div>
              <div className="text-xs text-slate-500 mt-1">कुल दिए गए टेस्ट प्रयास</div>
            </div>
          </div>
        </div>
      )}

      {/* Test Edit Modal */}
      {editingTest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
              {isCreatingTest ? 'नया टेस्ट बनाएं' : 'टेस्ट सेटिंग्स संपादित करें'}
            </h3>

            <form onSubmit={handleSaveTestForm} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">टेस्ट शीर्षक (Title):</label>
                <input
                  type="text"
                  required
                  value={editingTest.title}
                  onChange={(e) => setEditingTest({ ...editingTest, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">उपशीर्षक (Sub-title):</label>
                <input
                  type="text"
                  value={editingTest.subTitle}
                  onChange={(e) => setEditingTest({ ...editingTest, subTitle: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">अवधि (मिनट):</label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={editingTest.durationMinutes}
                    onChange={(e) =>
                      setEditingTest({
                        ...editingTest,
                        durationMinutes: parseInt(e.target.value, 10) || 15,
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    अंक प्रति प्रश्न:
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={editingTest.marksPerQuestion}
                    onChange={(e) =>
                      setEditingTest({
                        ...editingTest,
                        marksPerQuestion: parseFloat(e.target.value) || 1.0,
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    ऋणात्मक अंक (Negative Marks):
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    value={editingTest.negativeMarksPerQuestion}
                    onChange={(e) =>
                      setEditingTest({
                        ...editingTest,
                        negativeMarksPerQuestion: parseFloat(e.target.value) || 0.0,
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">सत्र वर्ष:</label>
                  <input
                    type="text"
                    value={editingTest.syllabusYear}
                    onChange={(e) =>
                      setEditingTest({ ...editingTest, syllabusYear: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingTest(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold"
                >
                  सहेजें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
