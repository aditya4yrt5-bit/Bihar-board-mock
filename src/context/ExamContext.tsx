import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ExamClassId,
  TestModel,
  TestAttempt,
  BookmarkItem,
  UserProfile,
  Question,
  ExamCategory,
} from '../types';
import {
  EXAM_CATEGORIES,
  INITIAL_TESTS,
  INITIAL_USER_PROFILE,
  INITIAL_TEST_HISTORY,
  SUBJECTS_CLASS_10,
} from '../data/mockData';

export type AppView =
  | 'home'
  | 'categories'
  | 'subjects'
  | 'test-instructions'
  | 'test-player'
  | 'results'
  | 'bookmarks'
  | 'profile'
  | 'ai-assistant'
  | 'admin'
  | 'database-guide'
  | 'system-tests';

interface ExamContextType {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  selectedClassId: ExamClassId;
  setSelectedClassId: (id: ExamClassId) => void;
  selectedCategory: ExamCategory;
  tests: TestModel[];
  setTests: React.Dispatch<React.SetStateAction<TestModel[]>>;
  activeTest: TestModel | null;
  setActiveTest: (test: TestModel | null) => void;
  activeAttempt: TestAttempt | null;
  setActiveAttempt: (attempt: TestAttempt | null) => void;
  testHistory: TestAttempt[];
  recordTestAttempt: (attempt: TestAttempt) => void;
  bookmarks: BookmarkItem[];
  toggleBookmark: (question: Question, testTitle?: string) => void;
  isBookmarked: (questionId: string) => boolean;
  userProfile: UserProfile;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  isAdminMode: boolean;
  setIsAdminMode: (admin: boolean) => void;
  selectedSubjectId: string | null;
  setSelectedSubjectId: (id: string | null) => void;
  selectedChapterId: string | null;
  setSelectedChapterId: (id: string | null) => void;
  startTest: (test: TestModel) => void;
  retryWrongQuestions: (attempt: TestAttempt) => void;
  // Admin Operations
  saveTest: (test: TestModel) => void;
  deleteTest: (testId: string) => void;
  togglePublishTest: (testId: string) => void;
  importQuestionsToTest: (testId: string, questions: Question[]) => void;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TESTS: 'beg_tests_v1',
  HISTORY: 'beg_history_v1',
  BOOKMARKS: 'beg_bookmarks_v1',
  PROFILE: 'beg_profile_v1',
  CLASS: 'beg_selected_class_v1',
};

export const ExamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [selectedClassId, setSelectedClassId] = useState<ExamClassId>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CLASS);
    return (saved as ExamClassId) || 'bseb-class-10-matric';
  });

  const [tests, setTests] = useState<TestModel[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TESTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved tests, fallback to initial', e);
    }
    return INITIAL_TESTS;
  });

  const [testHistory, setTestHistory] = useState<TestAttempt[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse history', e);
    }
    return INITIAL_TEST_HISTORY;
  });

  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse bookmarks', e);
    }
    return [];
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse profile', e);
    }
    return INITIAL_USER_PROFILE;
  });

  const [activeTest, setActiveTest] = useState<TestModel | null>(null);
  const [activeAttempt, setActiveAttempt] = useState<TestAttempt | null>(null);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TESTS, JSON.stringify(tests));
  }, [tests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(testHistory));
  }, [testHistory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLASS, selectedClassId);
  }, [selectedClassId]);

  const selectedCategory =
    EXAM_CATEGORIES.find((cat) => cat.id === selectedClassId) || EXAM_CATEGORIES[0];

  const recordTestAttempt = (attempt: TestAttempt) => {
    setTestHistory((prev) => [attempt, ...prev]);
    setActiveAttempt(attempt);

    // Update user stats
    setUserProfile((prev) => {
      const totalTests = prev.testsCompletedCount + 1;
      const prevTotalScore = prev.averageScorePercentage * prev.testsCompletedCount;
      const newAverage = Math.round((prevTotalScore + attempt.percentage) / totalTests);
      const addedMinutes = Math.max(1, Math.round(attempt.timeSpentSeconds / 60));

      return {
        ...prev,
        testsCompletedCount: totalTests,
        averageScorePercentage: newAverage,
        totalTimeMinutes: prev.totalTimeMinutes + addedMinutes,
      };
    });
  };

  const toggleBookmark = (question: Question, testTitle?: string) => {
    setBookmarks((prev) => {
      const exists = prev.some((b) => b.questionId === question.id);
      if (exists) {
        return prev.filter((b) => b.questionId !== question.id);
      } else {
        const newItem: BookmarkItem = {
          id: `bm-${Date.now()}-${question.id}`,
          questionId: question.id,
          question,
          addedAt: new Date().toISOString(),
          testTitle,
        };
        return [newItem, ...prev];
      }
    });

    setUserProfile((prev) => ({
      ...prev,
      bookmarksCount: bookmarks.some((b) => b.questionId === question.id)
        ? Math.max(0, prev.bookmarksCount - 1)
        : prev.bookmarksCount + 1,
    }));
  };

  const isBookmarked = (questionId: string) => {
    return bookmarks.some((b) => b.questionId === questionId);
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...updates }));
  };

  const startTest = (test: TestModel) => {
    setActiveTest(test);
    setCurrentView('test-instructions');
  };

  const retryWrongQuestions = (attempt: TestAttempt) => {
    const originalTest = tests.find((t) => t.id === attempt.testId);
    if (!originalTest) return;

    const wrongQuestions = originalTest.questions.filter((q) =>
      attempt.wrongQuestionIds.includes(q.id)
    );

    if (wrongQuestions.length === 0) return;

    const retryTest: TestModel = {
      ...originalTest,
      id: `retry-${Date.now()}-${originalTest.id}`,
      title: `पुनः अभ्यास: ${originalTest.title} (केवल गलत प्रश्न)`,
      subTitle: `आपने पूर्व प्रयास में ${wrongQuestions.length} प्रश्न गलत किए थे। उन्हें सुधारें!`,
      durationMinutes: Math.max(5, Math.ceil(wrongQuestions.length * 1.5)),
      totalQuestions: wrongQuestions.length,
      questions: wrongQuestions,
      isDemoPractice: true,
      createdAt: new Date().toISOString(),
    };

    setActiveTest(retryTest);
    setCurrentView('test-instructions');
  };

  // Admin operations
  const saveTest = (testToSave: TestModel) => {
    setTests((prev) => {
      const index = prev.findIndex((t) => t.id === testToSave.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = testToSave;
        return updated;
      }
      return [testToSave, ...prev];
    });
  };

  const deleteTest = (testId: string) => {
    setTests((prev) => prev.filter((t) => t.id !== testId));
  };

  const togglePublishTest = (testId: string) => {
    setTests((prev) =>
      prev.map((t) => {
        if (t.id === testId) {
          return { ...t, isPublished: !t.isPublished };
        }
        return t;
      })
    );
  };

  const importQuestionsToTest = (testId: string, questionsToAdd: Question[]) => {
    setTests((prev) =>
      prev.map((t) => {
        if (t.id === testId) {
          const updatedQuestions = [...t.questions, ...questionsToAdd];
          return {
            ...t,
            questions: updatedQuestions,
            totalQuestions: updatedQuestions.length,
          };
        }
        return t;
      })
    );
  };

  return (
    <ExamContext.Provider
      value={{
        currentView,
        setCurrentView,
        selectedClassId,
        setSelectedClassId,
        selectedCategory,
        tests,
        setTests,
        activeTest,
        setActiveTest,
        activeAttempt,
        setActiveAttempt,
        testHistory,
        recordTestAttempt,
        bookmarks,
        toggleBookmark,
        isBookmarked,
        userProfile,
        updateUserProfile,
        isAdminMode,
        setIsAdminMode,
        selectedSubjectId,
        setSelectedSubjectId,
        selectedChapterId,
        setSelectedChapterId,
        startTest,
        retryWrongQuestions,
        saveTest,
        deleteTest,
        togglePublishTest,
        importQuestionsToTest,
      }}
    >
      {children}
    </ExamContext.Provider>
  );
};

export const useExam = () => {
  const context = useContext(ExamContext);
  if (!context) {
    throw new Error('useExam must be used within an ExamProvider');
  }
  return context;
};
