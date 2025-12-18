export interface GrammarPoint {
  rule: string;
  explanation: string;
}

export interface Phrase {
  text: string;
  meaning: string;
  type: string; // e.g., "Idiom", "Phrasal Verb", "Collocation"
}

export interface AnalysisResult {
  translation: string;
  grammarPoints: GrammarPoint[];
  phrases: Phrase[];
  encouragement: string; // A short encouraging message for the kid
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}