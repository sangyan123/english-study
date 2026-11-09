import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// --- Schemas ---

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    translation: { type: Type.STRING, description: "The natural Chinese translation of the English text." },
    grammarPoints: {
      type: Type.ARRAY,
      description: "A list of grammatical rules found in the text.",
      items: {
        type: Type.OBJECT,
        properties: {
          rule: { type: Type.STRING, description: "The name of the grammar rule." },
          explanation: { type: Type.STRING, description: "A simple, child-friendly explanation in Chinese." },
        },
        required: ["rule", "explanation"],
      },
    },
    phrases: {
      type: Type.ARRAY,
      description: "A list of useful phrases, idioms, or collocations found.",
      items: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING, description: "The English phrase or idiom." },
          meaning: { type: Type.STRING, description: "The Chinese meaning." },
          type: { type: Type.STRING, description: "The type of phrase." },
        },
        required: ["text", "meaning", "type"],
      },
    },
    encouragement: { type: Type.STRING, description: "A short, cheerful message praising the child (in Chinese)." },
  },
  required: ["translation", "grammarPoints", "phrases", "encouragement"],
};

const quizSchema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      description: "A list of quiz questions based on the analyzed text.",
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING, description: "The quiz question in Chinese." },
          options: {
            type: Type.ARRAY,
            description: "4 answer options.",
            items: { type: Type.STRING },
          },
          correctIndex: { type: Type.INTEGER, description: "Index (0-3) of the correct answer." },
          explanation: { type: Type.STRING, description: "Brief explanation of why this is correct (in Chinese)." },
        },
        required: ["question", "options", "correctIndex", "explanation"],
      },
    },
  },
  required: ["questions"],
};

// --- API Routes ---

app.post('/api/analyze', async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Text is required' });
  }
  if (text.length > 5000) {
    return res.status(400).json({ error: 'Text is too long (max 5000 characters)' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API Key is missing on the server. Please set GEMINI_API_KEY in .env' });
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `You are a friendly and expert English teacher for children.\nAnalyze the following English text for a child student.\nIdentify grammar points, useful phrases/idioms, and provide a natural Chinese translation.\nKeep explanations simple, encouraging, and easy to understand.\n\nText to analyze: "${text}"`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: analysisSchema,
      },
    });

    const resultText = response.text;
    if (!resultText) {
      return res.status(500).json({ error: 'No response from AI' });
    }

    const data = JSON.parse(resultText);
    res.json(data);
  } catch (error) {
    console.error('Gemini Analysis Error:', error);
    res.status(500).json({ error: 'AI analysis failed. Please try again.' });
  }
});

app.post('/api/quiz', async (req, res) => {
  const { text, translation, phrases, grammarPoints } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Text is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API Key is missing on the server' });
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const context = JSON.stringify({ text, translation, phrases, grammarPoints });
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `You are creating a fun quiz for a child based on their English learning session.\nCreate 5 multiple-choice questions in Chinese that test understanding of vocabulary, grammar, and translation.\nMake questions age-appropriate (8-12 years old), fun, and encouraging.\nEach question must have exactly 4 options and one correct answer.\n\nLearning session data: ${context}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: quizSchema,
      },
    });

    const resultText = response.text;
    if (!resultText) {
      return res.status(500).json({ error: 'No response from AI' });
    }

    const data = JSON.parse(resultText);
    res.json(data);
  } catch (error) {
    console.error('Gemini Quiz Error:', error);
    res.status(500).json({ error: 'Quiz generation failed. Please try again.' });
  }
});

// --- Serve static files in production ---
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res) => {
    if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' });
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`API Server running at http://localhost:${PORT}`);
});

