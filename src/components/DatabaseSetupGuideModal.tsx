import React from 'react';
import { Database, ShieldCheck, Key, Server, Lock, X, Check, Copy } from 'lucide-react';

interface DatabaseSetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseSetupGuideModal: React.FC<DatabaseSetupGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedSection, setCopiedSection] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const firestoreRulesExample = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if requester is an authorized admin
    function isAdmin() {
      return request.auth != null &&
        request.auth.token.role == 'admin';
    }

    // Published tests: anyone can read; only admins can write
    match /tests/{testId} {
      allow read: if resource.data.isPublished == true || isAdmin();
      allow write: if isAdmin();
    }

    // Question bank: students only receive questions without unpublished answer keys
    match /questions/{questionId} {
      allow read: if resource.data.reviewStatus == 'समीक्षित (Verified)' || isAdmin();
      allow write: if isAdmin();
    }

    // Student attempts: students can create and view only their own attempts
    match /attempts/{attemptId} {
      allow create: if request.auth != null &&
        request.resource.data.userId == request.auth.uid;
      allow read: if request.auth != null &&
        (resource.data.userId == request.auth.uid || isAdmin());
      allow update, delete: if isAdmin();
    }

    // Student profile & bookmarks
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}`;

  const envExample = `# Bihar Exam Guru Environment Variables (.env)
# 1. Google Gemini AI API Key (Injected automatically in AI Studio via Settings > Secrets)
GEMINI_API_KEY="AIzaSy..."

# 2. Application hosting URL
APP_URL="https://ais-dev-a375scoaewkaj6e6nobshq-587878376786.asia-southeast1.run.app"

# 3. Optional: Firebase Web Client Config (For Production Cloud Persistence)
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="bihar-exam-guru.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="bihar-exam-guru"
VITE_FIREBASE_STORAGE_BUCKET="bihar-exam-guru.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="587878376786"
VITE_FIREBASE_APP_ID="1:587878376786:web:abcd1234"`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                बैकएंड, डेटाबेस एवं सुरक्षा विनिर्देश (Backend & Database Setup)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                स्थानीय डेमो मोड बनाम क्लाउड फायरबेस/फायरस्टोर का एकीकरण गाइड
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label="बंद करें"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Callout */}
        <div className="my-5 bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-950 space-y-2">
          <div className="flex items-center gap-2 font-bold text-blue-900">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>वर्तमान स्थिति: स्थानीय डेमो मोड (Local Demo Mode) सक्रिय</span>
          </div>
          <p className="text-slate-700 leading-relaxed">
            यह एप्लिकेशन वर्तमान में ब्राउज़र के <strong>स्थानीय स्टोरेज (localStorage)</strong> और{' '}
            <strong>Express सर्वर API</strong> पर कार्य कर रहा है। सभी 15+ मॉडल प्रश्न, टेस्ट
            परिणाम, अंकन नियम और AI गुरु समाधान पूरी तरह कार्यशील हैं।
          </p>
        </div>

        {/* Setup Accordions / Tabs */}
        <div className="space-y-4 text-xs">
          {/* Section 1: Env Variables */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-amber-600" />
                <span>1. पर्यावरण चर (Environment Variables - .env):</span>
              </span>
              <button
                onClick={() => handleCopy(envExample, 'env')}
                className="text-[11px] text-blue-900 font-semibold hover:underline flex items-center gap-1"
              >
                {copiedSection === 'env' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'env' ? 'कॉपी किया गया' : 'कॉपी करें'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto">
              {envExample}
            </pre>
          </div>

          {/* Section 2: Firestore Security Rules */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-rose-600" />
                <span>2. भूमिका आधारित सुरक्षा नियम (firestore.rules RBAC):</span>
              </span>
              <button
                onClick={() => handleCopy(firestoreRulesExample, 'rules')}
                className="text-[11px] text-blue-900 font-semibold hover:underline flex items-center gap-1"
              >
                {copiedSection === 'rules' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'rules' ? 'कॉपी किया गया' : 'कॉपी करें'}</span>
              </button>
            </div>
            <p className="text-slate-600 text-[11px]">
              यह सुनिश्चित करता है कि छात्र केवल प्रकाशित टेस्ट देख सकें, अपने अंक स्वयं न बदल सकें
              और टेस्ट सबमिट करने से पहले अनधिकृत उत्तरमाला तक न पहुंच सकें।
            </p>
            <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto max-h-48">
              {firestoreRulesExample}
            </pre>
          </div>

          {/* Section 3: Deployment Steps */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <Server className="w-4 h-4 text-emerald-600" />
              <span>3. उत्पादन परिनियोजन (Deployment Steps):</span>
            </span>
            <ol className="list-decimal list-inside space-y-1 text-slate-700 leading-relaxed">
              <li>
                <strong>बिल्ड:</strong> रन करें <code>npm run build</code> जिससे क्लाइंट एसेट्स <code>dist/</code> में संकलित होते हैं।
              </li>
              <li>
                <strong>स्टार्ट:</strong> पूर्ण स्टैक सर्वर <code>node server.ts</code> (या <code>npm start</code>) के माध्यम से पोर्ट 3000 पर एक्सप्रेस एवं जेमिनी एपीआई के साथ चालू होता है।
              </li>
              <li>
                <strong>AI Studio सीक्रेट्स:</strong> सुनिश्चित करें कि <code>GEMINI_API_KEY</code> सेटिंग के <strong>Secrets</strong> पैनल में कॉन्फ़िगर है।
              </li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition"
          >
            समझ गया
          </button>
        </div>
      </div>
    </div>
  );
};
