import React, { useState } from 'react';
import { useExam } from '../context/ExamContext';
import { SUBJECTS_CLASS_10 } from '../data/mockData';
import {
  Sparkles,
  Send,
  BookOpen,
  Target,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Lightbulb,
  GraduationCap,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const AiAssistantView: React.FC = () => {
  const { selectedCategory, testHistory } = useExam();

  const [activeTab, setActiveTab] = useState<'chat' | 'summary' | 'weaknesses'>('chat');

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-welcome',
      sender: 'ai',
      text: `नमस्ते! मैं आपका बिहार बोर्ड AI गुरु हूँ। 🙏\n\nआप मुझसे गणित के कठिन सवाल, विज्ञान के सिद्धांत, सामाजिक विज्ञान की ऐतिहासिक घटनाएं, या हिंदी-संस्कृत व्याकरण से जुड़ा कोई भी प्रश्न पूछ सकते हैं।\n\nआज आप किस टॉपिक को समझना चाहते हैं?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Summary Generator State
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS_CLASS_10[0].nameHi);
  const [selectedChapter, setSelectedChapter] = useState(
    SUBJECTS_CLASS_10[0].chapters[0].nameHi
  );
  const [summaryOutput, setSummaryOutput] = useState<string | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  // Weaknesses Analyzer State
  const [weaknessAnalysis, setWeaknessAnalysis] = useState<string | null>(null);
  const [isWeaknessLoading, setIsWeaknessLoading] = useState(false);

  const currentSubjectObj =
    SUBJECTS_CLASS_10.find((s) => s.nameHi === selectedSubject) || SUBJECTS_CLASS_10[0];

  // Quick suggestions for student
  const sampleDoubts = [
    'उत्तल और अवतल लेंस में क्या अंतर है?',
    'द्विघाती सूत्र (श्रीधराचार्य नियम) से मूल कैसे निकालें?',
    'चंपारण सत्याग्रह (1917) का मुख्य कारण क्या था?',
    '‘सत्यमेव जयते’ का भावार्थ समझाइए',
  ];

  // Handle send message
  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputQuery;
    if (!textToSend.trim() || isChatLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputQuery('');
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/gemini/doubt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          studentClass: selectedCategory.titleHi,
          subject: selectedSubject,
        }),
      });

      const data = await res.json();
      const replyText =
        data.reply ||
        data.error ||
        'AI गुरु से संपर्क नहीं हो पाया। कृपया सुनिश्चित करें कि सर्वर पर GEMINI_API_KEY सेट है।';

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `त्रुटि: AI उत्तर प्राप्त नहीं हो सका। कृपया अपनी इंटरनेट कनेक्टिविटी और API कुंजी की स्थिति जांचें।\n\n(ऑफ़लाइन टिप: अपने NCERT/BSTBPC पाठ्यपुस्तक के मुख्य सारांश बिंदुओं का अध्ययन करें।)`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Generate chapter summary
  const handleGenerateSummary = async () => {
    setIsSummaryLoading(true);
    setSummaryOutput(null);

    try {
      const res = await fetch('/api/gemini/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: selectedSubject,
          chapter: selectedChapter,
          classLevel: selectedCategory.titleHi,
        }),
      });

      const data = await res.json();
      if (data.summary) {
        setSummaryOutput(data.summary);
      } else {
        setSummaryOutput(
          data.error ||
            'रिवीजन समरी जनरेट नहीं हो सकी। कृपया सुनिश्चित करें कि GEMINI_API_KEY उपलब्ध है।'
        );
      }
    } catch (err: any) {
      setSummaryOutput('नेटवर्क समस्या: AI सारांश लोड नहीं किया जा सका।');
    } finally {
      setIsSummaryLoading(false);
    }
  };

  // Analyze Weaknesses from latest test
  const handleAnalyzeWeaknesses = async () => {
    if (testHistory.length === 0) {
      setWeaknessAnalysis(
        'आपने अभी तक कोई टेस्ट नहीं दिया है। पहले होम डैशबोर्ड से एक टेस्ट पूरा करें ताकि AI आपके गलत प्रश्नों का विश्लेषण कर सके।'
      );
      return;
    }

    const latest = testHistory[0];
    if (latest.incorrectCount === 0) {
      setWeaknessAnalysis(
        `शाबाश! आपने हालिया टेस्ट "${latest.testTitle}" में 100% सही उत्तर दिए हैं। कोई भी प्रश्न गलत नहीं हुआ। अपनी इस निरंतरता को बनाए रखें!`
      );
      return;
    }

    setIsWeaknessLoading(true);
    try {
      const wrongList = latest.topicBreakdown
        .filter((t) => t.incorrect > 0)
        .map((t) => ({
          subject: latest.subjectNameHi,
          chapter: t.topic,
          questionText: `${t.topic} में ${t.incorrect} गलतियां हुईं`,
        }));

      const res = await fetch('/api/gemini/suggest-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wrongQuestions: wrongList,
          testTitle: latest.testTitle,
          classLevel: selectedCategory.titleHi,
        }),
      });

      const data = await res.json();
      setWeaknessAnalysis(data.suggestions || data.error || 'सुझाव प्राप्त नहीं हुए।');
    } catch (err) {
      setWeaknessAnalysis('नेटवर्क समस्या: AI सुझाव प्राप्त नहीं हो सके।');
    } finally {
      setIsWeaknessLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-900 border border-orange-200 text-xs font-bold mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>Google Gemini 3.8 Flash द्वारा संचालित</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            AI गुरु (BSEB स्मार्ट स्टडी असिस्टेंट)
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            कठिन प्रश्नों का सरल हिंदी समाधान, चैप्टर रिवीजन नोट्स और व्यक्तिगत कमजोरी सुधार योजना
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold self-start">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'chat'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            शंका समाधान (Chat)
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'summary'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            रिवीजन समरी (Notes)
          </button>
          <button
            onClick={() => setActiveTab('weaknesses')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'weaknesses'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            कमजोरी विश्लेषण (Tips)
          </button>
        </div>
      </div>

      {/* Official Syllabus Disclaimer */}
      <div className="bg-amber-50 border border-amber-200/90 text-amber-900 rounded-xl p-3 text-xs flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold">सत्यापन सूचना:</span> AI गुरु द्वारा दी गई व्याख्या केवल
          सहायक मार्गदर्शन हेतु है। सभी तथ्य बिहार बोर्ड की आधिकारिक पाठ्यपुस्तकों
          (BSTBPC/NCERT) के अनुरूप प्रस्तुत किए जाते हैं। कृपया परीक्षा पूर्व अपनी पाठ्यपुस्तकों से
          भी मिलान करें।
        </div>
      </div>

      {/* TAB 1: Chat Doubt Solver */}
      {activeTab === 'chat' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col h-[560px] overflow-hidden">
          {/* Quick Suggestions Strip */}
          <div className="bg-slate-50 border-b border-slate-200 p-2.5 overflow-x-auto flex items-center gap-1.5 text-xs">
            <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap pl-1">
              त्वरित प्रश्न:
            </span>
            {sampleDoubts.map((doubt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(doubt)}
                className="whitespace-nowrap bg-white hover:bg-blue-50 hover:text-blue-900 border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700 text-xs transition"
              >
                {doubt}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg) => {
              const isAi = msg.sender === 'ai';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isAi ? 'justify-start' : 'justify-end'}`}
                >
                  {isAi && (
                    <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-xl rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                      isAi
                        ? 'bg-slate-50 text-slate-800 border border-slate-200'
                        : 'bg-blue-900 text-white font-medium'
                    }`}
                  >
                    <div>{msg.text}</div>
                    <div
                      className={`text-[10px] mt-1 text-right ${
                        isAi ? 'text-slate-400' : 'text-blue-200'
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}

            {isChatLoading && (
              <div className="flex items-center gap-2 text-xs text-slate-500 italic p-2">
                <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
                <span>AI गुरु सोच रहे हैं और सरल हिंदी में उत्तर तैयार कर रहे हैं...</span>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              placeholder="यहाँ अपना सवाल या गणित/विज्ञान का टॉपिक लिखें..."
              className="flex-1 bg-white text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-slate-900 placeholder:text-slate-400"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isChatLoading || !inputQuery.trim()}
              className="bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white px-4 py-3 rounded-xl font-bold transition flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">पूछें</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: Quick Revision Summary Generator */}
      {activeTab === 'summary' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">विषय चुनें:</label>
              <select
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  const sub = SUBJECTS_CLASS_10.find((s) => s.nameHi === e.target.value);
                  if (sub && sub.chapters.length > 0) {
                    setSelectedChapter(sub.chapters[0].nameHi);
                  }
                }}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900"
              >
                {SUBJECTS_CLASS_10.map((s) => (
                  <option key={s.id} value={s.nameHi}>
                    {s.nameHi} ({s.nameEn})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">अध्याय चुनें:</label>
              <select
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900"
              >
                {currentSubjectObj.chapters.map((ch) => (
                  <option key={ch.id} value={ch.nameHi}>
                    {ch.nameHi}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerateSummary}
            disabled={isSummaryLoading}
            className="w-full py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            {isSummaryLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>अध्याय सारांश तैयार हो रहा है...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>त्वरित रिवीजन नोट्स जनरेट करें</span>
              </>
            )}
          </button>

          {summaryOutput && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-blue-900">
                  {selectedSubject} : {selectedChapter}
                </span>
                <span className="text-[10px] text-orange-700 bg-orange-100 font-bold px-2 py-0.5 rounded">
                  AI रिवीजन नोट्स
                </span>
              </div>
              <div>{summaryOutput}</div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Weak Topics Analyzer */}
      {activeTab === 'weaknesses' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-5">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              गलत प्रश्नों पर आधारित व्यक्तिगत सुधार योजना
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              AI आपके पिछले टेस्ट परिणामों का विश्लेषण करेगा और 3 मुख्य सुधार बिंदुओं की सलाह देगा।
            </p>
          </div>

          <button
            onClick={handleAnalyzeWeaknesses}
            disabled={isWeaknessLoading}
            className="w-full py-3 bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            {isWeaknessLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>परीक्षण डेटा का विश्लेषण जारी है...</span>
              </>
            ) : (
              <>
                <Target className="w-4 h-4" />
                <span>हालिया टेस्ट की कमजोरियों का विश्लेषण करें</span>
              </>
            )}
          </button>

          {weaknessAnalysis && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line space-y-2">
              <div className="flex items-center gap-2 font-bold text-orange-800 mb-2">
                <Lightbulb className="w-4 h-4 text-orange-600" />
                <span>AI गुरु सुधार मार्गदर्शन:</span>
              </div>
              <div>{weaknessAnalysis}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
