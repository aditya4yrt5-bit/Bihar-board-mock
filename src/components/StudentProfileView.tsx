import React, { useState } from 'react';
import { useExam } from '../context/ExamContext';
import {
  User,
  Flame,
  Award,
  Clock,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Edit2,
  Save,
  RotateCcw,
} from 'lucide-react';
import { EXAM_CATEGORIES } from '../data/mockData';
import { ExamClassId } from '../types';

export const StudentProfileView: React.FC = () => {
  const {
    userProfile,
    updateUserProfile,
    testHistory,
    setActiveAttempt,
    setCurrentView,
  } = useExam();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: userProfile.name,
    rollCodeOrPhone: userProfile.rollCodeOrPhone,
    targetClass: userProfile.targetClass,
    district: userProfile.district,
    schoolName: userProfile.schoolName,
  });

  const handleSaveProfile = () => {
    updateUserProfile(formData);
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-900 to-indigo-800 text-white flex items-center justify-center text-2xl font-black shadow-md">
              {userProfile.name ? userProfile.name.charAt(0) : 'वि'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">{userProfile.name}</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  सत्यापित छात्र
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{userProfile.rollCodeOrPhone}</p>
              <p className="text-xs text-blue-900 font-semibold mt-0.5">
                {userProfile.schoolName} ({userProfile.district})
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (isEditing) handleSaveProfile();
              else setIsEditing(true);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto ${
              isEditing
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {isEditing ? (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>सहेजें</span>
              </>
            ) : (
              <>
                <Edit2 className="w-3.5 h-3.5" />
                <span>संपादित करें</span>
              </>
            )}
          </button>
        </div>

        {/* Edit Form (if toggled) */}
        {isEditing && (
          <div className="py-4 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">नाम:</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                रोल कोड / मोबाइल:
              </label>
              <input
                type="text"
                value={formData.rollCodeOrPhone}
                onChange={(e) => setFormData({ ...formData, rollCodeOrPhone: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">जिला:</label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">विद्यालय / कॉलेज:</label>
              <input
                type="text"
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300"
              />
            </div>
          </div>
        )}

        {/* 4 Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6">
          <div className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-4 text-center">
            <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center mx-auto mb-1">
              <Flame className="w-4 h-4 fill-white" />
            </div>
            <div className="text-xl font-bold text-slate-900 mt-1">
              {userProfile.streakDays} दिन
            </div>
            <div className="text-[11px] text-amber-800 font-medium">दैनिक अभ्यास स्ट्रीक</div>
          </div>

          <div className="bg-blue-50/70 border border-blue-200/60 rounded-2xl p-4 text-center">
            <div className="w-8 h-8 rounded-xl bg-blue-900 text-white flex items-center justify-center mx-auto mb-1">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold text-slate-900 mt-1">
              {userProfile.testsCompletedCount}
            </div>
            <div className="text-[11px] text-blue-900 font-medium">पूर्ण किए गए टेस्ट</div>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-2xl p-4 text-center">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-1">
              <Award className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold text-slate-900 mt-1">
              {userProfile.averageScorePercentage}%
            </div>
            <div className="text-[11px] text-emerald-800 font-medium">औसत प्राप्तांक प्रतिशत</div>
          </div>

          <div className="bg-purple-50/70 border border-purple-200/60 rounded-2xl p-4 text-center">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center mx-auto mb-1">
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold text-slate-900 mt-1">
              {userProfile.totalTimeMinutes}m
            </div>
            <div className="text-[11px] text-purple-900 font-medium">कुल अध्ययन समय</div>
          </div>
        </div>
      </div>

      {/* Test History Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            परीक्षण इतिहास एवं प्रगति पत्र (Test History)
          </h2>
          <span className="text-xs text-slate-500">कुल {testHistory.length} रिकॉर्ड्स</span>
        </div>

        {testHistory.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
            अभी तक कोई टेस्ट नहीं दिया गया है। होम डैशबोर्ड से अभ्यास शुरू करें।
          </div>
        ) : (
          <div className="space-y-3">
            {testHistory.map((att) => (
              <div
                key={att.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-300 transition"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                      {att.subjectNameHi}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(att.completedTime).toLocaleDateString('hi-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{att.testTitle}</h3>
                  <div className="text-xs text-slate-600 mt-1 flex items-center gap-3">
                    <span>
                      स्कोर: <strong className="text-slate-900">{att.score}/{att.maxScore}</strong> ({att.percentage}%)
                    </span>
                    <span>सटीकता: {att.accuracy}%</span>
                    <span>समय: {Math.round(att.timeSpentSeconds / 60)} मिनट</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveAttempt(att);
                      setCurrentView('results');
                    }}
                    className="bg-slate-100 hover:bg-blue-50 text-blue-950 font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1"
                  >
                    <span>समीक्षा देखें</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
