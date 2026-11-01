import {
  calculateScore,
  getQuestionPaletteStatus,
  formatTimeRemaining,
  validateQuestionImport,
} from './examEngine';
import { Question } from '../types';

export interface TestCaseResult {
  name: string;
  category: 'Timer' | 'Answer Selection' | 'Mark for Review' | 'Scoring' | 'Submission' | 'Import Validation';
  passed: boolean;
  message: string;
  durationMs: number;
}

export interface TestSuiteSummary {
  total: number;
  passed: number;
  failed: number;
  durationMs: number;
  results: TestCaseResult[];
}

const mockQuestions: Question[] = [
  {
    id: 't-q1',
    classId: 'bseb-class-10-matric',
    subjectId: 'maths-10',
    chapterId: 'm-ch1',
    language: 'hi',
    questionText: 'प्रश्न 1: 2 + 2 = ?',
    options: ['4', '5', '3', '6'],
    correctOptionIndex: 0,
    explanation: '2 + 2 = 4',
    difficulty: 'आसान',
    marks: 1.0,
    negativeMarks: 0.0,
    source: 'Test',
    syllabusYear: '2025-26',
    reviewStatus: 'समीक्षित (Verified)',
    isSampleDemo: true,
    topicTag: 'अंकगणित',
  },
  {
    id: 't-q2',
    classId: 'bseb-class-10-matric',
    subjectId: 'maths-10',
    chapterId: 'm-ch1',
    language: 'hi',
    questionText: 'प्रश्न 2: 3 × 3 = ?',
    options: ['6', '9', '12', '15'],
    correctOptionIndex: 1,
    explanation: '3 × 3 = 9',
    difficulty: 'आसान',
    marks: 1.0,
    negativeMarks: 0.25,
    source: 'Test',
    syllabusYear: '2025-26',
    reviewStatus: 'समीक्षित (Verified)',
    isSampleDemo: true,
    topicTag: 'गुणन',
  },
  {
    id: 't-q3',
    classId: 'bseb-class-10-matric',
    subjectId: 'maths-10',
    chapterId: 'm-ch2',
    language: 'hi',
    questionText: 'प्रश्न 3: 10 / 2 = ?',
    options: ['2', '4', '5', '10'],
    correctOptionIndex: 2,
    explanation: '10 / 2 = 5',
    difficulty: 'आसान',
    marks: 2.0,
    negativeMarks: 0.5,
    source: 'Test',
    syllabusYear: '2025-26',
    reviewStatus: 'समीक्षित (Verified)',
    isSampleDemo: true,
    topicTag: 'भाग',
  },
];

export function runAllAutomatedTests(): TestSuiteSummary {
  const startTime = performance.now();
  const results: TestCaseResult[] = [];

  // 1. Timer Behaviour Tests
  {
    const tStart = performance.now();
    const t1 = formatTimeRemaining(0) === '00:00';
    const t2 = formatTimeRemaining(65) === '01:05';
    const t3 = formatTimeRemaining(3665) === '01:01:05';
    const t4 = formatTimeRemaining(-10) === '00:00';
    const passed = t1 && t2 && t3 && t4;
    results.push({
      name: 'टाइमर फॉर्मैटिंग एवं शून्य समाप्ति सत्यापन (Timer Countdown & Expiry)',
      category: 'Timer',
      passed,
      message: passed ? 'शून्य सेकंड, मिनट व घंटे का प्रारूपण सफल रहा' : 'टाइमर रूपांतरण में विफलता',
      durationMs: performance.now() - tStart,
    });
  }

  // 2. Answer Selection & Palette State Tests
  {
    const tStart = performance.now();
    // Test 5 palette statuses
    const notVisited = getQuestionPaletteStatus('q1', {}, {}, {}) === 'not-visited';
    const notAnswered = getQuestionPaletteStatus('q1', {}, {}, { q1: true }) === 'not-answered';
    const answered = getQuestionPaletteStatus('q1', { q1: 2 }, {}, { q1: true }) === 'answered';
    const markedReview = getQuestionPaletteStatus('q1', {}, { q1: true }, { q1: true }) === 'marked-review';
    const answeredMarked = getQuestionPaletteStatus('q1', { q1: 1 }, { q1: true }, { q1: true }) === 'answered-marked';

    const passed = notVisited && notAnswered && answered && markedReview && answeredMarked;
    results.push({
      name: 'प्रश्न पैलेट की पांचों अवस्थाएं (5-State Question Palette Logic)',
      category: 'Answer Selection',
      passed,
      message: passed
        ? 'Not-visited, Visited, Answered, Marked, Answered & Marked सही पाए गए'
        : 'पैलेट स्टेटस मिलान में त्रुटि',
      durationMs: performance.now() - tStart,
    });
  }

  // 3. Mark for Review State Toggle
  {
    const tStart = performance.now();
    const answers: Record<string, number> = { 't-q1': 0 };
    let marked: Record<string, boolean> = { 't-q1': true };
    const statusMarked = getQuestionPaletteStatus('t-q1', answers, marked, { 't-q1': true });

    marked = { 't-q1': false };
    const statusUnmarked = getQuestionPaletteStatus('t-q1', answers, marked, { 't-q1': true });

    const passed = statusMarked === 'answered-marked' && statusUnmarked === 'answered';
    results.push({
      name: 'समीक्षा हेतु चिन्हित (Mark for Review) टॉगल व्यवहार',
      category: 'Mark for Review',
      passed,
      message: passed ? 'मार्क एवं अनमार्क अवस्था परिवर्तन सुचारू रूप से कार्य कर रहा है' : 'टॉगल अवस्था त्रुटि',
      durationMs: performance.now() - tStart,
    });
  }

  // 4. Scoring: Standard BSEB (No Negative Marking)
  {
    const tStart = performance.now();
    // q1 correct (0), q2 wrong (selected 0, correct 1), q3 unanswered
    const userAnswers: Record<string, number> = {
      't-q1': 0,
      't-q2': 0,
    };
    const res = calculateScore(mockQuestions, userAnswers, 1.0, 0.0);

    const passed =
      res.correctCount === 1 &&
      res.incorrectCount === 1 &&
      res.unansweredCount === 1 &&
      res.score === 1.0 &&
      res.wrongQuestionIds.includes('t-q2');

    results.push({
      name: 'बिहार बोर्ड मानक अंकन (No Negative Marking: Correct=1, Incorrect=0, Unattempted=0)',
      category: 'Scoring',
      passed,
      message: passed ? `सटीक स्कोर: ${res.score}/3, सही: ${res.correctCount}, गलत: ${res.incorrectCount}` : 'अंकन गणना त्रुटि',
      durationMs: performance.now() - tStart,
    });
  }

  // 5. Scoring: Configurable Negative Marking
  {
    const tStart = performance.now();
    const customQuestions: Question[] = [
      { ...mockQuestions[0], marks: 2.0, negativeMarks: 0.5 },
      { ...mockQuestions[1], marks: 2.0, negativeMarks: 0.5 },
    ];
    // Q1 correct (+2), Q2 wrong (-0.5) => Total = 1.5
    const answers: Record<string, number> = {
      't-q1': 0,
      't-q2': 2,
    };
    const res = calculateScore(customQuestions, answers, 2.0, 0.5);

    const passed = res.score === 1.5 && res.correctCount === 1 && res.incorrectCount === 1;
    results.push({
      name: 'कन्फिगरेबल निगेटिव मार्किंग (+2.0 सही, -0.50 गलत)',
      category: 'Scoring',
      passed,
      message: passed ? `निगेटिव कटौती उपरांत स्कोर: ${res.score}/4.0` : 'निगेटिव मार्किंग गणना में त्रुटि',
      durationMs: performance.now() - tStart,
    });
  }

  // 6. Test Submission & Topic Performance
  {
    const tStart = performance.now();
    const answers: Record<string, number> = {
      't-q1': 0,
      't-q2': 1,
      't-q3': 2,
    };
    const res = calculateScore(mockQuestions, answers, 1.0, 0.0);
    const passed =
      res.correctCount === 3 &&
      res.percentage === 100 &&
      res.accuracy === 100 &&
      res.topicBreakdown.length === 3;

    results.push({
      name: 'सम्पूर्ण सबमिशन एवं टॉपिक-वार प्रदर्शन विश्लेषण (Topic Analysis)',
      category: 'Submission',
      passed,
      message: passed ? '100% एक्यूरेसी और तीनों टॉपिक का ब्रेकडाउन सही तैयार हुआ' : 'सबमिशन रिपोर्ट त्रुटि',
      durationMs: performance.now() - tStart,
    });
  }

  // 7. Row-level Question Import Validator Test
  {
    const tStart = performance.now();
    const sampleImportData = [
      {
        questionText: 'प्रकाश के परावर्तन के कितने नियम हैं?',
        options: '1|2|3|4',
        correctOptionIndex: 1,
        explanation: 'दो नियम हैं।',
      },
      {
        // Invalid: missing options
        questionText: 'त्रुटिपूर्ण प्रश्न जहाँ विकल्प अनुपस्थित हैं',
        options: [],
        correctOptionIndex: 0,
      },
      {
        // Invalid: question text too short
        questionText: 'abc',
        options: 'A|B|C|D',
        correctOption: 'A',
      },
    ];

    const validation = validateQuestionImport(sampleImportData);
    const passed = validation.validQuestions.length === 1 && validation.errors.length === 2;

    results.push({
      name: 'प्रश्न आयात पंक्ति-वार सत्यापन (Row-Level CSV/JSON Validation)',
      category: 'Import Validation',
      passed,
      message: passed
        ? `1 मान्य प्रश्न स्वीकारी गई, 2 त्रुटिपूर्ण पंक्तियाँ रो-लेवल संदेश सहित पहचानी गईं`
        : 'इम्पोर्ट वैलिडेटर त्रुटि',
      durationMs: performance.now() - tStart,
    });
  }

  const durationMs = performance.now() - startTime;
  const passedCount = results.filter((r) => r.passed).length;

  return {
    total: results.length,
    passed: passedCount,
    failed: results.length - passedCount,
    durationMs: Math.round(durationMs * 10) / 10,
    results,
  };
}
