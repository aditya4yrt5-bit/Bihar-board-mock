import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell,
} from 'recharts';
import { TestAttempt } from '../types';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  Layers,
  Award,
  Filter,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface StudentProgressChartProps {
  testHistory: TestAttempt[];
  currentAttempt?: TestAttempt;
}

const SUBJECT_COLORS: Record<string, string> = {
  'maths-10': '#2563EB', // Blue
  'science-10': '#059669', // Emerald
  'social-10': '#D97706', // Amber
  'hindi-10': '#E11D48', // Rose
  'sanskrit-10': '#7C3AED', // Purple
  'all-subjects': '#EA580C', // Saffron Orange
  default: '#4F46E5', // Indigo
};

const SUBJECT_NAMES_HI: Record<string, string> = {
  'maths-10': 'गणित (Maths)',
  'science-10': 'विज्ञान (Science)',
  'social-10': 'सामाजिक विज्ञान (Social)',
  'hindi-10': 'हिन्दी (Hindi)',
  'sanskrit-10': 'संस्कृत (Sanskrit)',
  'all-subjects': 'महामॉक (All Subjects)',
};

export const StudentProgressChart: React.FC<StudentProgressChartProps> = ({
  testHistory,
  currentAttempt,
}) => {
  const [chartView, setChartView] = useState<'timeline' | 'subjects'>('timeline');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');

  // Combine history + current attempt ensuring no duplicate IDs
  const allAttempts = useMemo(() => {
    const list = [...testHistory];
    if (currentAttempt && !list.some((a) => a.id === currentAttempt.id)) {
      list.unshift(currentAttempt);
    }
    // Sort chronologically (oldest first for timeline)
    return list.sort(
      (a, b) => new Date(a.completedTime).getTime() - new Date(b.completedTime).getTime()
    );
  }, [testHistory, currentAttempt]);

  // Filter attempts if a subject is chosen
  const filteredAttempts = useMemo(() => {
    if (selectedSubjectFilter === 'all') return allAttempts;
    return allAttempts.filter(
      (a) => a.subjectId === selectedSubjectFilter || a.subjectId === 'all-subjects'
    );
  }, [allAttempts, selectedSubjectFilter]);

  // Format data for Timeline Progress Chart
  const timelineData = useMemo(() => {
    return filteredAttempts.map((att, idx) => {
      const dateObj = new Date(att.completedTime);
      const isToday =
        new Date().toDateString() === dateObj.toDateString() ||
        (currentAttempt && att.id === currentAttempt.id);

      const formattedDate = isToday
        ? 'आज (नवीनतम)'
        : dateObj.toLocaleDateString('hi-IN', {
            month: 'short',
            day: 'numeric',
          });

      const label = `T${idx + 1}: ${formattedDate}`;

      return {
        id: att.id,
        label,
        formattedDate,
        testTitle: att.testTitle,
        subjectName: att.subjectNameHi || 'सामान्य',
        subjectId: att.subjectId,
        percentage: att.percentage,
        accuracy: att.accuracy,
        score: att.score,
        maxScore: att.maxScore,
        correctCount: att.correctCount,
        incorrectCount: att.incorrectCount,
        color: SUBJECT_COLORS[att.subjectId] || SUBJECT_COLORS.default,
        isCurrent: currentAttempt ? att.id === currentAttempt.id : false,
      };
    });
  }, [filteredAttempts, currentAttempt]);

  // Aggregate performance by subject for Bar Chart
  const subjectBreakdownData = useMemo(() => {
    const map: Record<
      string,
      {
        subjectName: string;
        subjectId: string;
        totalScores: number;
        attemptsCount: number;
        bestScore: number;
        totalCorrect: number;
        totalQuestions: number;
      }
    > = {};

    allAttempts.forEach((att) => {
      const subId = att.subjectId || 'all-subjects';
      const subName = att.subjectNameHi || SUBJECT_NAMES_HI[subId] || 'सामान्य';

      if (!map[subId]) {
        map[subId] = {
          subjectName: subName,
          subjectId: subId,
          totalScores: 0,
          attemptsCount: 0,
          bestScore: 0,
          totalCorrect: 0,
          totalQuestions: 0,
        };
      }

      map[subId].totalScores += att.percentage;
      map[subId].attemptsCount += 1;
      map[subId].bestScore = Math.max(map[subId].bestScore, att.percentage);
      map[subId].totalCorrect += att.correctCount;
      map[subId].totalQuestions += att.totalQuestions;
    });

    return Object.values(map).map((s) => ({
      subject: s.subjectName.split('(')[0].trim(),
      fullSubjectName: s.subjectName,
      subjectId: s.subjectId,
      avgScore: Math.round(s.totalScores / s.attemptsCount),
      bestScore: s.bestScore,
      attempts: s.attemptsCount,
      color: SUBJECT_COLORS[s.subjectId] || SUBJECT_COLORS.default,
    }));
  }, [allAttempts]);

  // Overall trajectory metrics
  const firstScore = allAttempts.length > 0 ? allAttempts[0].percentage : 0;
  const latestScore =
    allAttempts.length > 0 ? allAttempts[allAttempts.length - 1].percentage : 0;
  const growthRate = latestScore - firstScore;

  // Custom Recharts Tooltip in Hindi
  const CustomTimelineTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1.5 max-w-xs backdrop-blur-md">
          <div className="flex items-center justify-between gap-2 border-b border-slate-700 pb-1">
            <span className="font-bold text-amber-300">{data.formattedDate}</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded text-slate-200">
              {data.subjectName}
            </span>
          </div>

          <div className="font-semibold text-slate-100 line-clamp-1">{data.testTitle}</div>

          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
            <div>
              <span className="text-slate-400 block">प्राप्तांक:</span>
              <span className="font-bold text-amber-400 text-sm">
                {data.percentage}% ({data.score}/{data.maxScore})
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">सटीकता (Accuracy):</span>
              <span className="font-bold text-emerald-400 text-sm">{data.accuracy}%</span>
            </div>
          </div>

          <div className="text-[10px] text-slate-300 pt-1 border-t border-slate-800 flex justify-between">
            <span>सही: {data.correctCount}</span>
            <span>गलत: {data.incorrectCount}</span>
            <span className="text-orange-300 font-semibold">
              {data.percentage >= 60 ? 'प्रथम श्रेणी' : 'अभ्यास आवश्यक'}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomSubjectTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1.5 backdrop-blur-md">
          <div className="font-bold text-amber-300">{data.fullSubjectName}</div>
          <div className="text-slate-300">
            औसत प्राप्तांक:{' '}
            <strong className="text-emerald-400 font-bold">{data.avgScore}%</strong>
          </div>
          <div className="text-slate-300">
            सर्वश्रेष्ठ प्राप्तांक: <strong>{data.bestScore}%</strong>
          </div>
          <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
            कुल दिए गए टेस्ट: {data.attempts}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <section className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-5">
      {/* Top Header of Chart Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 mb-1">
            <TrendingUp className="w-4 h-4 text-orange-600" />
            <span>विद्यार्थी प्रगति चार्ट (Recharts Performance Analytics)</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            समय के साथ विषयवार प्रगति व प्रदर्शन विश्लेषण
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            बिहार बोर्ड परीक्षा तैयारी में आपके अंकों का ऐतिहासिक ग्राफ व विषयवार तुलना
          </p>
        </div>

        {/* View Mode Toggle: Timeline vs Subject Comparison */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold self-start sm:self-auto">
          <button
            onClick={() => setChartView('timeline')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              chartView === 'timeline'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>समय-रेखा (Timeline)</span>
          </button>
          <button
            onClick={() => setChartView('subjects')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              chartView === 'subjects'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>विषयवार तुलना (Subjects)</span>
          </button>
        </div>
      </div>

      {/* Subject Filter Pills (Visible when in Timeline mode) */}
      {chartView === 'timeline' && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 shrink-0">
            <Filter className="w-3 h-3" />
            <span>विषय फ़िल्टर:</span>
          </span>
          <button
            onClick={() => setSelectedSubjectFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition ${
              selectedSubjectFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            सभी विषय ({allAttempts.length})
          </button>
          {Object.entries(SUBJECT_NAMES_HI).map(([key, name]) => {
            const hasAttempts = allAttempts.some((a) => a.subjectId === key);
            if (!hasAttempts && key !== 'all-subjects') return null;
            const isSelected = selectedSubjectFilter === key;

            return (
              <button
                key={key}
                onClick={() => setSelectedSubjectFilter(key)}
                className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: SUBJECT_COLORS[key] || '#2563EB' }}
                />
                <span>{name.split('(')[0]}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Growth Metric Callout Banner */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-orange-50 border border-blue-100 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-900 text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <span className="font-bold text-slate-900 block">
              प्रगति विश्लेषण (Performance Trajectory):
            </span>
            <span className="text-slate-600">
              {growthRate >= 0 ? (
                <>
                  आपने प्रारंभिक टेस्ट ({firstScore}%) की तुलना में{' '}
                  <strong className="text-emerald-700">+{growthRate}% का सुधार</strong> दर्ज किया है।
                </>
              ) : (
                <>
                  वर्तमान स्कोर {latestScore}% है। नियमित अध्यायवार अभ्यास से सटीकता और बढ़ाई जा सकती है।
                </>
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto text-[11px] font-semibold">
          <span className="flex items-center gap-1 text-blue-900">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
            प्राप्तांक % (Score)
          </span>
          <span className="flex items-center gap-1 text-emerald-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            सटीकता % (Accuracy)
          </span>
        </div>
      </div>

      {/* Recharts Container */}
      <div className="w-full h-72 sm:h-80 pt-2">
        {chartView === 'timeline' ? (
          timelineData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              इस विषय के लिए कोई पूर्व टेस्ट डेटा उपलब्ध नहीं है।
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={timelineData}
                margin={{ top: 10, right: 15, left: -20, bottom: 25 }}
              >
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="accGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 60, 75, 100]}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickLine={false}
                  axisLine={false}
                  unit="%"
                />
                <Tooltip content={<CustomTimelineTooltip />} />
                <ReferenceLine
                  y={60}
                  stroke="#EA580C"
                  strokeDasharray="4 4"
                  label={{
                    value: 'प्रथम श्रेणी (60%)',
                    fill: '#EA580C',
                    fontSize: 10,
                    position: 'insideTopLeft',
                  }}
                />
                <ReferenceLine
                  y={80}
                  stroke="#059669"
                  strokeDasharray="4 4"
                  label={{
                    value: 'डिस्टिंक्शन (80%)',
                    fill: '#059669',
                    fontSize: 10,
                    position: 'insideTopLeft',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="percentage"
                  name="प्राप्तांक प्रतिशत"
                  stroke="#1D4ED8"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#scoreGradient)"
                  activeDot={{ r: 6, fill: '#1D4ED8', stroke: '#FFFFFF', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  name="सटीकता प्रतिशत"
                  stroke="#059669"
                  strokeWidth={2}
                  strokeDasharray="4 2"
                  dot={{ r: 4, fill: '#059669' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )
        ) : (
          /* Subject Comparison Bar Chart */
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={subjectBreakdownData}
              margin={{ top: 15, right: 15, left: -20, bottom: 15 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis
                dataKey="subject"
                tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 20, 40, 60, 80, 100]}
                tick={{ fontSize: 11, fill: '#64748B' }}
                tickLine={false}
                axisLine={false}
                unit="%"
              />
              <Tooltip content={<CustomSubjectTooltip />} />
              <ReferenceLine
                y={60}
                stroke="#EA580C"
                strokeDasharray="4 4"
                label={{
                  value: 'न्यूनतम लक्ष्य (60%)',
                  fill: '#EA580C',
                  fontSize: 10,
                  position: 'insideTopRight',
                }}
              />
              <Bar dataKey="avgScore" name="औसत प्राप्तांक (%)" radius={[8, 8, 0, 0]} maxBarSize={48}>
                {subjectBreakdownData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend & Guide footer */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-1.5 bg-blue-600 inline-block rounded-xs" />
            <span>गणित / विज्ञान / सा.वि. प्रगति</span>
          </span>
          <span className="flex items-center gap-1 text-orange-600 font-medium">
            <span className="w-2.5 h-0.5 border-t border-dashed border-orange-600 inline-block" />
            <span>60% प्रथम श्रेणी रेखा</span>
          </span>
        </div>
        <div className="text-slate-400">
          कुल विश्लेषणित टेस्ट: <strong>{allAttempts.length}</strong>
        </div>
      </div>
    </section>
  );
};
