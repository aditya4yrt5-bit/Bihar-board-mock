import React from 'react';
import { useExam, AppView } from '../context/ExamContext';
import {
  GraduationCap,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Database,
  Flame,
  Menu,
  X,
  BookOpen,
  HelpCircle,
  Activity,
} from 'lucide-react';
import { EXAM_CATEGORIES } from '../data/mockData';
import { ExamClassId } from '../types';

interface HeaderProps {
  onOpenDbGuide: () => void;
  onOpenSystemTests: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenDbGuide, onOpenSystemTests }) => {
  const {
    currentView,
    setCurrentView,
    selectedClassId,
    setSelectedClassId,
    isAdminMode,
    setIsAdminMode,
    userProfile,
  } = useExam();

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // If in test-player, header shows minimal mode
  if (currentView === 'test-player') {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs">
      {/* Top Demo Notification Strip */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-900 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-amber-300">डेमो अभ्यास मोड:</span>
            <span className="text-slate-200 truncate">
              स्थानीय डेटा सक्रिय • BSEB 2025-26 नवीनतम परीक्षा प्रारूप
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenSystemTests}
              className="hidden sm:inline-flex items-center gap-1 text-[11px] bg-white/10 hover:bg-white/20 text-blue-100 px-2 py-0.5 rounded transition"
              title="सिस्टम यूनिट टेस्ट रन करें"
            >
              <Activity className="w-3 h-3 text-emerald-300" />
              <span>सिस्टम टेस्ट</span>
            </button>
            <button
              onClick={onOpenDbGuide}
              className="inline-flex items-center gap-1 text-[11px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/30 px-2 py-0.5 rounded transition"
            >
              <Database className="w-3 h-3 text-amber-400" />
              <span className="hidden xs:inline">बैकएंड</span> सेटअप
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tagline */}
          <div
            className="flex items-center gap-3 cursor-pointer group select-none"
            onClick={() => setCurrentView('home')}
          >
            {/* Custom Bihar Exam Guru Emblem: Bodhi flame & book medallion */}
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-900 via-blue-800 to-indigo-900 text-white flex items-center justify-center shadow-md shadow-blue-900/20 group-hover:scale-105 transition-transform">
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 border-2 border-white flex items-center justify-center">
                <Sparkles className="w-2 h-2 text-white" />
              </div>
              <GraduationCap className="w-6 h-6 text-amber-400" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-bold tracking-tight text-blue-950">
                  बिहार एग्जाम <span className="text-orange-600">गुरु</span>
                </span>
                <span className="hidden md:inline-block text-[10px] uppercase font-bold tracking-wider bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded">
                  BSEB
                </span>
              </div>
              <span className="text-[11px] text-slate-500 -mt-0.5 font-medium hidden sm:inline">
                पढ़ाई स्मार्ट, सफलता शानदार!
              </span>
            </div>
          </div>

          {/* Desktop Class Selector & Nav Links */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 font-medium pl-2">कक्षा:</span>
              <select
                aria-label="कक्षा चुनें"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value as ExamClassId)}
                className="text-xs font-semibold bg-white text-blue-950 py-1.5 px-2.5 rounded-lg border border-slate-300 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-600"
              >
                {EXAM_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.titleHi}
                  </option>
                ))}
              </select>
            </div>

            <nav className="flex items-center gap-1 text-sm font-medium">
              <button
                onClick={() => setCurrentView('home')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  currentView === 'home'
                    ? 'text-blue-900 bg-blue-50 font-semibold'
                    : 'text-slate-600 hover:text-blue-900 hover:bg-slate-50'
                }`}
              >
                डैशबोर्ड
              </button>
              <button
                onClick={() => setCurrentView('categories')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  currentView === 'categories'
                    ? 'text-blue-900 bg-blue-50 font-semibold'
                    : 'text-slate-600 hover:text-blue-900 hover:bg-slate-50'
                }`}
              >
                सिलेबस व पैटर्न
              </button>
              <button
                onClick={() => setCurrentView('subjects')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  currentView === 'subjects'
                    ? 'text-blue-900 bg-blue-50 font-semibold'
                    : 'text-slate-600 hover:text-blue-900 hover:bg-slate-50'
                }`}
              >
                विषयवार टेस्ट
              </button>
              <button
                onClick={() => setCurrentView('ai-assistant')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  currentView === 'ai-assistant'
                    ? 'text-orange-700 bg-orange-50 font-semibold'
                    : 'text-slate-600 hover:text-orange-600 hover:bg-orange-50/50'
                }`}
              >
                <Sparkles className="w-4 h-4 text-orange-500" />
                <span>AI गुरु</span>
              </button>
              <button
                onClick={() => setCurrentView('bookmarks')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  currentView === 'bookmarks'
                    ? 'text-blue-900 bg-blue-50 font-semibold'
                    : 'text-slate-600 hover:text-blue-900 hover:bg-slate-50'
                }`}
              >
                सहेजे गए प्रश्न
              </button>
            </nav>
          </div>

          {/* User & Admin controls */}
          <div className="flex items-center gap-2.5">
            {/* Streak Counter */}
            <div
              className="flex items-center gap-1 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-lg text-amber-800 text-xs font-bold"
              title="दैनिक अध्ययन स्ट्रीक"
            >
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
              <span>{userProfile.streakDays} दिन</span>
            </div>

            {/* Admin Toggle */}
            <button
              onClick={() => {
                setIsAdminMode(!isAdminMode);
                if (!isAdminMode) setCurrentView('admin');
              }}
              className={`text-xs px-2.5 py-1.5 rounded-lg border font-semibold transition flex items-center gap-1.5 ${
                isAdminMode
                  ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
              title="एडमिन पोर्टल (प्रश्न बैंक व टेस्ट प्रबंधन)"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isAdminMode ? 'एडमिन एक्टिव' : 'शिक्षक / एडमिन'}
              </span>
            </button>

            {/* Profile Avatar */}
            <button
              onClick={() => setCurrentView('profile')}
              className="flex items-center gap-2 p-1 pl-2 bg-slate-50 hover:bg-blue-50 rounded-xl border border-slate-200 transition"
              title="विद्यार्थी प्रोफाइल"
            >
              <span className="text-xs font-semibold text-slate-700 hidden sm:inline max-w-[100px] truncate">
                {userProfile.name}
              </span>
              <div className="w-7 h-7 rounded-lg bg-blue-900 text-white text-xs font-bold flex items-center justify-center">
                {userProfile.name ? userProfile.name.charAt(0) : 'वि'}
              </div>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="मेनू खोलें"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 py-3 space-y-2 animate-in fade-in duration-150">
            <div className="px-2 py-1.5 bg-slate-100 rounded-lg mb-2">
              <label className="text-[11px] text-slate-500 font-medium block mb-1">
                कक्षा चयन:
              </label>
              <select
                aria-label="कक्षा चयन"
                value={selectedClassId}
                onChange={(e) => {
                  setSelectedClassId(e.target.value as ExamClassId);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-xs font-semibold bg-white text-blue-950 py-1.5 px-2 rounded-md border border-slate-300"
              >
                {EXAM_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.titleHi}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-xs font-medium">
              <button
                onClick={() => {
                  setCurrentView('home');
                  setMobileMenuOpen(false);
                }}
                className="p-2 text-left rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-800"
              >
                🏠 होम डैशबोर्ड
              </button>
              <button
                onClick={() => {
                  setCurrentView('categories');
                  setMobileMenuOpen(false);
                }}
                className="p-2 text-left rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-800"
              >
                📚 सिलेबस व पैटर्न
              </button>
              <button
                onClick={() => {
                  setCurrentView('subjects');
                  setMobileMenuOpen(false);
                }}
                className="p-2 text-left rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-800"
              >
                📝 विषयवार टेस्ट
              </button>
              <button
                onClick={() => {
                  setCurrentView('ai-assistant');
                  setMobileMenuOpen(false);
                }}
                className="p-2 text-left rounded-lg bg-orange-50 text-orange-800 font-semibold"
              >
                ✨ AI गुरु सहायक
              </button>
              <button
                onClick={() => {
                  setCurrentView('bookmarks');
                  setMobileMenuOpen(false);
                }}
                className="p-2 text-left rounded-lg bg-slate-50 text-slate-800"
              >
                🔖 सहेजे गए प्रश्न ({userProfile.bookmarksCount})
              </button>
              <button
                onClick={() => {
                  onOpenSystemTests();
                  setMobileMenuOpen(false);
                }}
                className="p-2 text-left rounded-lg bg-emerald-50 text-emerald-800"
              >
                ⚡ सिस्टम टेस्ट चलाएं
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export const BottomNav: React.FC = () => {
  const { currentView, setCurrentView, bookmarks } = useExam();

  // Hide in full-screen test player
  if (currentView === 'test-player') {
    return null;
  }

  const navItems: Array<{ id: AppView; label: string; icon: string }> = [
    { id: 'home', label: 'होम', icon: '🏠' },
    { id: 'subjects', label: 'विषय', icon: '📖' },
    { id: 'ai-assistant', label: 'AI गुरु', icon: '✨' },
    { id: 'bookmarks', label: 'सहेजे', icon: '🔖' },
    { id: 'profile', label: 'प्रोफाइल', icon: '👤' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 lg:hidden shadow-lg safe-area-bottom">
      <div className="grid grid-cols-5 h-14">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex flex-col items-center justify-center gap-0.5 relative transition-colors ${
                isActive ? 'text-blue-900 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span className="text-[10px] leading-tight">{item.label}</span>
              {item.id === 'bookmarks' && bookmarks.length > 0 && (
                <span className="absolute top-1.5 right-4 w-4 h-4 rounded-full bg-orange-600 text-white text-[9px] font-bold flex items-center justify-center">
                  {bookmarks.length}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-blue-900 rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
