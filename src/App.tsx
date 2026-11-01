import React, { useState } from 'react';
import { ExamProvider, useExam } from './context/ExamContext';
import { Header, BottomNav } from './components/Header';
import { LandingHome } from './components/LandingHome';
import { ExamCategoriesView } from './components/ExamCategoriesView';
import { SubjectSelectionView } from './components/SubjectSelectionView';
import { TestInstructionsModal } from './components/TestInstructionsModal';
import { TestPlayer } from './components/TestPlayer';
import { ResultsView } from './components/ResultsView';
import { AiAssistantView } from './components/AiAssistantView';
import { BookmarksView } from './components/BookmarksView';
import { StudentProfileView } from './components/StudentProfileView';
import { AdminDashboard } from './components/AdminDashboard';
import { DatabaseSetupGuideModal } from './components/DatabaseSetupGuideModal';
import { SystemTestsModal } from './components/SystemTestsModal';

const AppContent: React.FC = () => {
  const { currentView } = useExam();
  const [isDbGuideOpen, setIsDbGuideOpen] = useState(false);
  const [isSystemTestsOpen, setIsSystemTestsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        onOpenDbGuide={() => setIsDbGuideOpen(true)}
        onOpenSystemTests={() => setIsSystemTestsOpen(true)}
      />

      {/* Main Content Router */}
      <div className={`flex-1 ${currentView !== 'test-player' ? 'max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5' : ''}`}>
        {currentView === 'home' && <LandingHome />}
        {currentView === 'categories' && <ExamCategoriesView />}
        {currentView === 'subjects' && <SubjectSelectionView />}
        {currentView === 'test-instructions' && (
          <>
            <LandingHome />
            <TestInstructionsModal />
          </>
        )}
        {currentView === 'test-player' && <TestPlayer />}
        {currentView === 'results' && <ResultsView />}
        {currentView === 'ai-assistant' && <AiAssistantView />}
        {currentView === 'bookmarks' && <BookmarksView />}
        {currentView === 'profile' && <StudentProfileView />}
        {currentView === 'admin' && <AdminDashboard />}
      </div>

      {/* Global Modals */}
      <DatabaseSetupGuideModal
        isOpen={isDbGuideOpen}
        onClose={() => setIsDbGuideOpen(false)}
      />

      <SystemTestsModal
        isOpen={isSystemTestsOpen}
        onClose={() => setIsSystemTestsOpen(false)}
      />

      {/* Mobile-First Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default function App() {
  return (
    <ExamProvider>
      <AppContent />
    </ExamProvider>
  );
}
