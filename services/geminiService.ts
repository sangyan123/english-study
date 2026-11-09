import { AnalysisResult, QuizResult } from '../types';

const API_BASE = '/api';

async function fetchAPI<T>(endpoint: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export const analyzeText = async (text: string): Promise<AnalysisResult> => {
  return fetchAPI<AnalysisResult>('/analyze', { text });
};

export const generateQuiz = async (
  text: string,
  analysis: AnalysisResult
): Promise<QuizResult> => {
  return fetchAPI<QuizResult>('/quiz', {
    text,
    translation: analysis.translation,
    phrases: analysis.phrases,
    grammarPoints: analysis.grammarPoints,
  });
};
