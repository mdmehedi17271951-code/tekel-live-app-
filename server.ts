import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize server-side Gemini client
const apiKey = process.env.GEMINI_API_KEY || '';

const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const TEKEL_AI_SYSTEM_INSTRUCTION = `You are Tekel AI (টেকেল এআই), the intelligent, friendly, and helpful AI assistant of Tekel Live (টেকেল লাইভ) — Bangladesh's premier modern social media platform.
Your goals and traits:
- Bilingual mastery: You are completely fluent in both Bengali (বাংলা) and English.
- Natural language matching: When a user writes in Bengali (or Banglish), respond in warm, natural, and expressive Bengali. When they write in English, respond in polished, clear English.
- Social media assistant: You can generate captivating post captions, hashtags, travel recommendations, technology explanations, creative stories, poetry, and educational answers.
- Formatting: Use structured Markdown with clear headings, bullet points, and bold text for readability. Keep tone respectful, encouraging, and culturally thoughtful.`;

// Secure Backend Route for Tekel AI Chat
app.post('/api/ai/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not configured in environment.');
      res.json({
        reply: 'টেকেল এআই বর্তমানে প্রস্তুত হচ্ছে। অনুগ্রহ করে নিশ্চিত করুন যে AI Studio Secrets প্যানেলে আপনার GEMINI_API_KEY সক্রিয় রয়েছে। (Tekel AI is initializing. Please verify GEMINI_API_KEY in Secrets).',
      });
      return;
    }

    // Format conversation history for Gemini API
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(history)) {
      // Include last 10 turns to maintain context without token overload
      const recentHistory = history.slice(-10);
      for (const item of recentHistory) {
        if (item && item.text) {
          contents.push({
            role: item.role === 'model' ? 'model' : 'user',
            parts: [{ text: String(item.text) }],
          });
        }
      }
    }

    // Add current user prompt
    contents.push({
      role: 'user',
      parts: [{ text: message.trim() }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction: TEKEL_AI_SYSTEM_INSTRUCTION,
      },
    });

    const reply = response.text || 'দুঃখিত, কোনো উত্তর পাওয়া যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।';
    res.json({ reply });
  } catch (error: any) {
    console.error('Gemini API Error on server:', error);
    res.status(500).json({
      error: error.message || 'AI সেবা প্রদানে সাময়িক ত্রুটি ঘটেছে।',
      reply: 'দুঃখিত, এই মুহূর্তে উত্তর দিতে সমস্যা হচ্ছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।',
    });
  }
});

// Vite Middleware for Development / Static build for Production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Tekel Live server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
