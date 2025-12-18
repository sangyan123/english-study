import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

// Define the schema strictly to match the AnalysisResult interface
const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    translation: {
      type: Type.STRING,
      description: "The natural Chinese translation of the English text.",
    },
    grammarPoints: {
      type: Type.ARRAY,
      description: "A list of grammatical rules found in the text.",
      items: {
        type: Type.OBJECT,
        properties: {
          rule: {
            type: Type.STRING,
            description: "The name of the grammar rule (e.g., 'Past Tense', 'Subject-Verb Agreement').",
          },
          explanation: {
            type: Type.STRING,
            description: "A simple, child-friendly explanation of how this grammar is used in the sentence in Chinese.",
          },
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
          text: {
            type: Type.STRING,
            description: "The English phrase or idiom.",
          },
          meaning: {
            type: Type.STRING,
            description: "The Chinese meaning of the phrase.",
          },
          type: {
             type: Type.STRING,
             description: "The type of phrase (e.g., Short Phrase, Idiom).",
          }
        },
        required: ["text", "meaning", "type"],
      },
    },
    encouragement: {
      type: Type.STRING,
      description: "A short, cheerful message praising the child for learning (in Chinese).",
    },
  },
  required: ["translation", "grammarPoints", "phrases", "encouragement"],
};

export const analyzeText = async (text: string): Promise<AnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a friendly and expert English teacher for children. 
      Analyze the following English text for a child student. 
      Identify grammar points, useful phrases/idioms, and provide a natural Chinese translation.
      Keep explanations simple, encouraging, and easy to understand.
      
      Text to analyze: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response from AI");
    }

    const data = JSON.parse(resultText) as AnalysisResult;
    return data;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};