export type ExamClassId =
  | 'bseb-class-9'
  | 'bseb-class-10-matric'
  | 'bseb-class-11'
  | 'bseb-class-12-inter'
  | 'bseb-nmms';

export type TestType = 'mock' | 'chapter' | 'subject' | 'daily' | 'pyq';

export type QuestionDifficulty = 'आसान' | 'मध्यम' | 'कठिन';

export type QuestionReviewStatus = 'समीक्षित (Verified)' | 'ड्राफ्ट (Draft)' | 'संशोधित (Revised)';

export interface Question {
  id: string;
  classId: ExamClassId;
  subjectId: string;
  chapterId: string;
  language: 'hi' | 'en' | 'bilingual';
  questionText: string;
  questionTextEn?: string;
  options: string[];
  optionsEn?: string[];
  correctOptionIndex: number; // 0 to 3 (or n-1)
  explanation: string;
  difficulty: QuestionDifficulty;
  marks: number;
  negativeMarks: number;
  source: string; // e.g. "BSEB 2025 मॉडल प्रारूप", "BSTBPC अभ्यास"
  syllabusYear: string; // e.g. "2025-2026"
  reviewStatus: QuestionReviewStatus;
  isSampleDemo: boolean;
  topicTag?: string;
}

export interface Chapter {
  id: string;
  subjectId: string;
  nameHi: string;
  nameEn: string;
  weightage: string;
  keyTopics: string[];
}

export interface Subject {
  id: string;
  classId: ExamClassId;
  nameHi: string;
  nameEn: string;
  code: string;
  iconName: string;
  color: string;
  chapters: Chapter[];
}

export interface ExamCategory {
  id: ExamClassId;
  titleHi: string;
  titleEn: string;
  badge: string;
  description: string;
  syllabusYear: string;
  verificationStatus: string;
  examPatternSummary: string;
  popularSubjects: string[];
}

export interface TestModel {
  id: string;
  title: string;
  subTitle: string;
  type: TestType;
  classId: ExamClassId;
  subjectId: string;
  subjectNameHi: string;
  chapterId?: string;
  chapterNameHi?: string;
  durationMinutes: number;
  totalQuestions: number;
  marksPerQuestion: number;
  negativeMarksPerQuestion: number;
  passingPercentage: number;
  syllabusYear: string;
  verificationStatus: string;
  isDemoPractice: boolean;
  isPublished: boolean;
  isArchived?: boolean;
  instructions: string[];
  questions: Question[];
  createdAt: string;
}

export type QuestionNavStatus =
  | 'answered'
  | 'not-answered'
  | 'marked-review'
  | 'answered-marked'
  | 'not-visited';

export interface TestAttempt {
  id: string;
  testId: string;
  testTitle: string;
  classId: ExamClassId;
  subjectId: string;
  subjectNameHi: string;
  startTime: string;
  completedTime: string;
  timeSpentSeconds: number;
  totalQuestions: number;
  answers: Record<string, number>; // questionId -> selected option
  markedForReview: Record<string, boolean>;
  score: number;
  maxScore: number;
  percentage: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  accuracy: number;
  topicBreakdown: Array<{
    topic: string;
    total: number;
    correct: number;
    incorrect: number;
    accuracy: number;
  }>;
  wrongQuestionIds: string[];
  isDemoResult: boolean;
}

export interface BookmarkItem {
  id: string;
  questionId: string;
  question: Question;
  addedAt: string;
  testTitle?: string;
  userNotes?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  rollCodeOrPhone: string;
  role: 'student' | 'admin';
  targetClass: ExamClassId;
  district: string;
  schoolName: string;
  streakDays: number;
  testsCompletedCount: number;
  averageScorePercentage: number;
  totalTimeMinutes: number;
  bookmarksCount: number;
}
