import React from 'react';
import { VocabEntry } from '../types';
import { speakEnglish, SpeakerButton } from './SpeakerButton';

interface Props {
  vocab: VocabEntry[];
  onRemove: (phraseText: string) => void;
  onClearAll: () => void;
}

export const VocabPanel: React.FC<Props> = ({ vocab, onRemove, onClearAll }) => {
  if (vocab.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-8 text-center border-2 border-gray-100">
        <div className="text-5xl mb-4">⭐</div>
        <p className="text-xl font-bold text-gray-500">Your vocab book is empty!</p>
        <p className="text-gray-400 mt-2">Click the ⭐ on any phrase to save it here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-gray-700">⭐ My Vocab Book ({vocab.length})</h2>
        <button
          onClick={onClearAll}
          className="text-sm font-bold text-red-400 hover:text-red-600 transition-colors"
        >
          Clear All
        </button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {vocab.map((entry) => (
          <div
            key={entry.phrase.text}
            className="bg-white rounded-2xl shadow-md border-2 border-green-100 p-5 hover:border-brand-green transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="font-bold text-lg text-green-800">{entry.phrase.text}</span>
                  <span className="text-xs px-2 py-0.5 bg-green-50 text-green-600 rounded-full font-bold border border-green-200">
                    {entry.phrase.type}
                  </span>
                </div>
                <p className="text-gray-600">{entry.phrase.meaning}</p>
                <p className="text-xs text-gray-400 mt-2 truncate">
                  From: "{entry.sourceText.length > 40 ? entry.sourceText.slice(0, 40) + '...' : entry.sourceText}"
                </p>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <SpeakerButton
                  onClick={() => speakEnglish(entry.phrase.text)}
                  className="text-brand-green hover:bg-green-50"
                />
                <button
                  onClick={() => onRemove(entry.phrase.text)}
                  className="text-gray-300 hover:text-red-400 transition-colors p-2"
                  title="Remove"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
