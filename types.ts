export interface GrammarPoint {
  rule: string;
  explanation: string;
}

export interface Phrase {
  text: string;
  meaning: string;
  type: string;
}

export interface AnalysisResult {
  translation: string;
  grammarPoints: GrammarPoint[];
  phrases: Phrase[];
  encouragement: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizResult {
  questions: QuizQuestion[];
}

export interface HistoryEntry {
  id: string;
  inputText: string;
  result: AnalysisResult;
  timestamp: number;
}

export interface VocabEntry {
  phrase: Phrase;
  sourceText: string;
  savedAt: number;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
