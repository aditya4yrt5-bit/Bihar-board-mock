import { Question, QuestionNavStatus, TestAttempt, ExamClassId } from '../types';

export interface ScoreCalculationResult {
  score: number;
  maxScore: number;
  percentage: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  accuracy: number;
  wrongQuestionIds: string[];
  topicBreakdown: Array<{
    topic: string;
    total: number;
    correct: number;
    incorrect: number;
    accuracy: number;
  }>;
}

/**
 * Calculates score, accuracy, and topic breakdown based on configurable marking rules.
 * Never hardcodes marking scheme!
 */
export function calculateScore(
  questions: Question[],
  answers: Record<string, number>,
  marksPerQuestion: number = 1.0,
  negativeMarksPerQuestion: number = 0.0
): ScoreCalculationResult {
  let score = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;
  const wrongQuestionIds: string[] = [];
  const topicMap: Record<string, { total: number; correct: number; incorrect: number }> = {};

  const totalQuestions = questions.length;
  const maxScore = totalQuestions * marksPerQuestion;

  questions.forEach((q) => {
    const topic = q.topicTag || 'सामान्य';
    if (!topicMap[topic]) {
      topicMap[topic] = { total: 0, correct: 0, incorrect: 0 };
    }
    topicMap[topic].total += 1;

    const selected = answers[q.id];

    if (selected === undefined || selected === null) {
      unansweredCount += 1;
    } else if (selected === q.correctOptionIndex) {
      correctCount += 1;
      score += q.marks !== undefined ? q.marks : marksPerQuestion;
      topicMap[topic].correct += 1;
    } else {
      incorrectCount += 1;
      const penalty = q.negativeMarks !== undefined ? q.negativeMarks : negativeMarksPerQuestion;
      score -= Math.abs(penalty);
      wrongQuestionIds.push(q.id);
      topicMap[topic].incorrect += 1;
    }
  });

  // Score cannot drop below zero in general school board exams
  const finalScore = Math.max(0, Math.round(score * 100) / 100);
  const percentage = maxScore > 0 ? Math.round((finalScore / maxScore) * 1000) / 10 : 0;
  const attempted = correctCount + incorrectCount;
  const accuracy = attempted > 0 ? Math.round((correctCount / attempted) * 1000) / 10 : 0;

  const topicBreakdown = Object.entries(topicMap).map(([topic, data]) => ({
    topic,
    total: data.total,
    correct: data.correct,
    incorrect: data.incorrect,
    accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
  }));

  return {
    score: finalScore,
    maxScore,
    percentage,
    correctCount,
    incorrectCount,
    unansweredCount,
    accuracy,
    wrongQuestionIds,
    topicBreakdown,
  };
}

/**
 * Determines standard 5-state palette status for BSEB/NTA/online tests
 */
export function getQuestionPaletteStatus(
  questionId: string,
  answers: Record<string, number>,
  markedForReview: Record<string, boolean>,
  visitedQuestions: Record<string, boolean>
): QuestionNavStatus {
  const isAnswered = answers[questionId] !== undefined && answers[questionId] !== null;
  const isMarked = Boolean(markedForReview[questionId]);
  const isVisited = Boolean(visitedQuestions[questionId]);

  if (isAnswered && isMarked) {
    return 'answered-marked';
  }
  if (isMarked) {
    return 'marked-review';
  }
  if (isAnswered) {
    return 'answered';
  }
  if (isVisited) {
    return 'not-answered';
  }
  return 'not-visited';
}

/**
 * Format time in seconds to mm:ss or hh:mm:ss
 */
export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Row-level validator for CSV/JSON question import into the Question Bank
 */
export interface RowValidationError {
  row: number;
  field: string;
  message: string;
}

export interface QuestionImportValidationResult {
  validQuestions: Question[];
  errors: RowValidationError[];
}

export function validateQuestionImport(
  rawList: any[],
  defaultClassId: ExamClassId = 'bseb-class-10-matric'
): QuestionImportValidationResult {
  const validQuestions: Question[] = [];
  const errors: RowValidationError[] = [];

  rawList.forEach((item, index) => {
    const rowNum = index + 1;

    // Validate Question Text
    if (!item.questionText || typeof item.questionText !== 'string' || item.questionText.trim().length < 5) {
      errors.push({
        row: rowNum,
        field: 'questionText',
        message: 'प्रश्न विवरण (Question text) आवश्यक है (कम से कम 5 अक्षर)।',
      });
      return;
    }

    // Validate Options
    let parsedOptions: string[] = [];
    if (Array.isArray(item.options)) {
      parsedOptions = item.options.map((o: any) => String(o).trim());
    } else if (typeof item.options === 'string') {
      parsedOptions = item.options.split('|').map((o: string) => o.trim());
    }

    if (parsedOptions.length < 2) {
      errors.push({
        row: rowNum,
        field: 'options',
        message: 'कम से कम 2 या 4 विकल्प होने चाहिए (उदा. "A|B|C|D" या Array)।',
      });
      return;
    }

    // Validate Correct Option Index
    let correctIndex = Number(item.correctOptionIndex);
    if (isNaN(correctIndex) || correctIndex < 0 || correctIndex >= parsedOptions.length) {
      // Check if letter A, B, C, D was given
      if (typeof item.correctOption === 'string') {
        const letter = item.correctOption.trim().toUpperCase();
        const mapLetter: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
        if (mapLetter[letter] !== undefined && mapLetter[letter] < parsedOptions.length) {
          correctIndex = mapLetter[letter];
        } else {
          errors.push({
            row: rowNum,
            field: 'correctOptionIndex',
            message: `सही विकल्प सूचकांक (0 से ${parsedOptions.length - 1} या A-D) अमान्य है।`,
          });
          return;
        }
      } else {
        errors.push({
          row: rowNum,
          field: 'correctOptionIndex',
          message: `सही विकल्प (0 से ${parsedOptions.length - 1}) अनिवार्य है।`,
        });
        return;
      }
    }

    const question: Question = {
      id: item.id || `imp-q-${Date.now()}-${rowNum}`,
      classId: item.classId || defaultClassId,
      subjectId: item.subjectId || 'general',
      chapterId: item.chapterId || 'ch-general',
      language: item.language || 'hi',
      questionText: item.questionText.trim(),
      questionTextEn: item.questionTextEn?.trim(),
      options: parsedOptions,
      optionsEn: Array.isArray(item.optionsEn) ? item.optionsEn : undefined,
      correctOptionIndex: correctIndex,
      explanation: item.explanation?.trim() || 'व्याख्या उपलब्ध नहीं है।',
      difficulty: item.difficulty === 'कठिन' || item.difficulty === 'मध्यम' ? item.difficulty : 'आसान',
      marks: Number(item.marks) > 0 ? Number(item.marks) : 1.0,
      negativeMarks: Number(item.negativeMarks) >= 0 ? Number(item.negativeMarks) : 0.0,
      source: item.source?.trim() || 'प्रशिक्षक आयातित प्रश्न (Imported)',
      syllabusYear: item.syllabusYear?.trim() || '2025-2026',
      reviewStatus: item.reviewStatus || 'समीक्षित (Verified)',
      isSampleDemo: false,
      topicTag: item.topicTag?.trim() || 'सामान्य',
    };

    validQuestions.push(question);
  });

  return { validQuestions, errors };
}
