import { AnalysisResult, HistoryEntry, Phrase, VocabEntry } from '../types';

const HISTORY_KEY = 'english-explorer-history';
const VOCAB_KEY = 'english-explorer-vocab';

// --- History ---

export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveToHistory(inputText: string, result: AnalysisResult): HistoryEntry {
  const history = getHistory();
  const entry: HistoryEntry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    inputText,
    result,
    timestamp: Date.now(),
  };
  const updated = [entry, ...history].slice(0, 100);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  return entry;
}

export function deleteHistoryItem(id: string): void {
  const history = getHistory().filter(h => h.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

// --- Vocabulary Book ---

export function getVocab(): VocabEntry[] {
  try {
    const raw = localStorage.getItem(VOCAB_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isVocabSaved(phraseText: string): boolean {
  return getVocab().some(v => v.phrase.text === phraseText);
}

export function toggleVocab(phrase: Phrase, sourceText: string): boolean {
  const vocab = getVocab();
  const exists = vocab.findIndex(v => v.phrase.text === phrase.text);
  if (exists >= 0) {
    vocab.splice(exists, 1);
    localStorage.setItem(VOCAB_KEY, JSON.stringify(vocab));
    return false;
  } else {
    vocab.unshift({ phrase, sourceText, savedAt: Date.now() });
    localStorage.setItem(VOCAB_KEY, JSON.stringify(vocab));
    return true;
  }
}

export function removeVocab(phraseText: string): void {
  const vocab = getVocab().filter(v => v.phrase.text !== phraseText);
  localStorage.setItem(VOCAB_KEY, JSON.stringify(vocab));
}

export function clearVocab(): void {
  localStorage.removeItem(VOCAB_KEY);
}
