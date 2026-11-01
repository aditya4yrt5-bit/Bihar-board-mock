import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini SDK with User-Agent as instructed by gemini-api skill
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey && apiKey.trim() !== '') {
  try {
    aiClient = new GoogleGenAI({
      apiKey: apiKey.trim(),
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to instantiate GoogleGenAI:', err);
  }
}

// Health & status endpoint
app.get('/api/status', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    appName: 'Bihar Exam Guru',
    hasGeminiKey: Boolean(aiClient),
    environment: isProduction ? 'production' : 'development',
    serverTime: new Date().toISOString(),
  });
});

// Helper for AI responses
const BSEB_AI_SYSTEM_INSTRUCTION = `आप 'बिहार एग्जाम गुरु' (Bihar Exam Guru) के समर्पित AI शिक्षक (AI गुरु) हैं।
आपका कार्य बिहार विद्यालय परीक्षा समिति (BSEB - Bihar School Examination Board) पटना के कक्षा 9वीं, 10वीं मैट्रिक, 11वीं, 12वीं इंटर एवं NMMS परीक्षा के छात्रों को सरल, सुगम और सटीक हिंदी में मार्गदर्शन देना है।
दिशानिर्देश:
1. हमेशा सरल, सम्मानजनक एवं प्रेरक हिंदी भाषा का प्रयोग करें। कठिन तकनीकी या अंग्रेजी शब्दों को कोष्ठक (brackets) में स्पष्ट करें।
2. बिहार बोर्ड के आधिकारिक पाठ्यक्रम (BSTBPC / NCERT) और परीक्षा पैटर्न के अनुरूप उत्तर दें। मनगढ़ंत तथ्य न बनाएं।
3. उत्तर बिंदुवार (bullet points), चरणबद्ध (step-by-step) और याद रखने में आसान तरीके से दें।
4. हर व्याख्या में छात्र को 'परीक्षा टिप' (Board Exam Tip) अवश्य दें।
5. उत्तर के अंत में यह स्पष्ट करें कि यह उत्तर AI द्वारा तैयार किया गया है और छात्र अपनी पाठ्यपुस्तक से भी मिलान करें।`;

// 1. Question Explanation API
app.post('/api/gemini/explain', async (req: Request, res: Response): Promise<void> => {
  try {
    const { questionText, options, selectedOption, correctOption, subject, chapter, classLevel } = req.body;

    if (!questionText) {
      res.status(400).json({ error: 'Question text is required' });
      return;
    }

    if (!aiClient) {
      res.status(503).json({
        error: 'Gemini API Key is not configured on server',
        fallbackAvailable: true,
      });
      return;
    }

    const prompt = `कक्षा: ${classLevel || 'BSEB'}
विषय: ${subject || 'सामान्य'}
अध्याय: ${chapter || 'अध्याय'}
प्रश्न: "${questionText}"
विकल्प:
${Array.isArray(options) ? options.map((opt: string, i: number) => `(${i + 1}) ${opt}`).join('\n') : ''}

सही विकल्प: ${correctOption !== undefined ? correctOption : 'निर्धारित नहीं'}
छात्र का चुना विकल्प: ${selectedOption !== undefined ? selectedOption : 'कोई विकल्प नहीं चुना'}

कृपया इस प्रश्न का विस्तृत समाधान और व्याख्या सरल हिंदी में दें:
1. सही उत्तर क्या है और क्यों सही है (तर्क व सूत्र)।
2. यदि छात्र ने गलत विकल्प चुना था, तो वह क्यों गलत था।
3. इस विषय से जुड़ा मुख्य कॉन्सेप्ट (Key Concept)।
4. बिहार बोर्ड परीक्षा के लिए विशेष सलाह (Exam Tip)।`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: BSEB_AI_SYSTEM_INSTRUCTION,
      },
    });

    const explanation = response.text || 'व्याख्या तैयार नहीं हो सकी।';
    res.json({
      success: true,
      explanation,
      isAiGenerated: true,
      source: 'Gemini 3.8 Flash (Bihar Exam Guru AI)',
    });
  } catch (error: any) {
    console.error('Error generating explanation:', error);
    res.status(500).json({
      error: error?.message || 'AI व्याख्या लोड करने में समस्या हुई।',
      fallbackAvailable: true,
    });
  }
});

// 2. Quick Revision Summary API
app.post('/api/gemini/summary', async (req: Request, res: Response): Promise<void> => {
  try {
    const { subject, chapter, classLevel } = req.body;

    if (!subject || !chapter) {
      res.status(400).json({ error: 'Subject and chapter are required' });
      return;
    }

    if (!aiClient) {
      res.status(503).json({
        error: 'Gemini API Key is not configured on server',
        fallbackAvailable: true,
      });
      return;
    }

    const prompt = `बिहार बोर्ड (${classLevel || 'BSEB'}) के विषय "${subject}" के अध्याय "${chapter}" का क्विक रिवीजन सारांश (Quick Revision Notes) तैयार करें।
कृपया निम्नलिखित प्रारूप में बिंदुवार प्रस्तुत करें:
1. महत्वपूर्ण परिभाषाएं और मुख्य सिद्धांत (Top 4 Definitions / Principles)
2. महत्वपूर्ण सूत्र या ऐतिहासिक तिथियां/तथ्य (Key Formulas / Facts)
3. बोर्ड परीक्षा में बार-बार पूछे जाने वाले 3 वस्तुनिष्ठ प्रश्न (Sample High-yield MCQs)
4. परीक्षा की दृष्टि से सबसे महत्वपूर्ण टॉपिक्स (Important Focus Areas)`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: BSEB_AI_SYSTEM_INSTRUCTION,
      },
    });

    res.json({
      success: true,
      summary: response.text,
      isAiGenerated: true,
      chapter,
      subject,
    });
  } catch (error: any) {
    console.error('Error generating summary:', error);
    res.status(500).json({
      error: error?.message || 'रिवीजन सारांश जनरेट करने में त्रुटि।',
      fallbackAvailable: true,
    });
  }
});

// 3. Weak Topics & Improvement Suggestions API
app.post('/api/gemini/suggest-topics', async (req: Request, res: Response): Promise<void> => {
  try {
    const { wrongQuestions, testTitle, classLevel } = req.body;

    if (!wrongQuestions || !Array.isArray(wrongQuestions) || wrongQuestions.length === 0) {
      res.status(400).json({ error: 'List of wrong questions is required' });
      return;
    }

    if (!aiClient) {
      res.status(503).json({
        error: 'Gemini API Key is not configured on server',
        fallbackAvailable: true,
      });
      return;
    }

    const questionsList = wrongQuestions
      .slice(0, 10)
      .map((q: any, idx: number) => `${idx + 1}. [${q.subject || ''} - ${q.chapter || ''}] ${q.questionText || ''}`)
      .join('\n');

    const prompt = `छात्र ने "${testTitle || 'मॉक टेस्ट'}" (${classLevel || 'BSEB'}) में निम्नलिखित प्रश्नों के गलत उत्तर दिए हैं:
${questionsList}

कृपया एक मार्गदर्शक शिक्षक के रूप में छात्र के लिए व्यक्तिगत अध्ययन योजना बनाएं:
1. छात्र की मुख्य कमजोरियां किस अध्याय या टॉपिक में हैं?
2. अगले 3 दिनों में किन 3 मुख्य विषयों पर तुरंत ध्यान देने की आवश्यकता है?
3. प्रश्नों को हल करते समय किन सामान्य गलतियों से बचना चाहिए?
4. एक सकारात्मक व प्रेरणादायक संदेश।`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: BSEB_AI_SYSTEM_INSTRUCTION,
      },
    });

    res.json({
      success: true,
      suggestions: response.text,
      isAiGenerated: true,
    });
  } catch (error: any) {
    console.error('Error generating suggestions:', error);
    res.status(500).json({
      error: error?.message || 'सुझाव जनरेट करने में त्रुटि।',
      fallbackAvailable: true,
    });
  }
});

// 4. AI Doubt Solver Chat
app.post('/api/gemini/doubt', async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, history, studentClass, subject } = req.body;

    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    if (!aiClient) {
      res.status(503).json({
        error: 'Gemini API Key is not configured on server',
        fallbackAvailable: true,
      });
      return;
    }

    const contextPrompt = `छात्र की कक्षा: ${studentClass || '10वीं (मैट्रिक)'}\nविषय: ${subject || 'सामान्य'}\nछात्र का प्रश्न: ${message}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contextPrompt,
      config: {
        systemInstruction: `${BSEB_AI_SYSTEM_INSTRUCTION}
आप छात्र के शंका समाधान (Doubt Clearing) के लिए उत्तर दे रहे हैं। उत्तर संक्षिप्त, उत्साहवर्धक और उदाहरण सहित होना चाहिए।`,
      },
    });

    res.json({
      success: true,
      reply: response.text,
      isAiGenerated: true,
    });
  } catch (error: any) {
    console.error('Error in AI Doubt Solver:', error);
    res.status(500).json({
      error: error?.message || 'शंका समाधान प्राप्त करने में त्रुटि।',
      fallbackAvailable: true,
    });
  }
});

// Mount Vite middleware in development or static serve in production
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Bihar Exam Guru server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
