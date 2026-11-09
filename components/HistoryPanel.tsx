import React from 'react';
import { HistoryEntry } from '../types';
import { speakEnglish, SpeakerButton } from './SpeakerButton';

interface Props {
  history: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryPanel: React.FC<Props> = ({ history, onSelect, onDelete, onClearAll }) => {
  if (history.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-8 text-center border-2 border-gray-100">
        <div className="text-5xl mb-4">📚</div>
        <p className="text-xl font-bold text-gray-500">No history yet!</p>
        <p className="text-gray-400 mt-2">Analyze a sentence and it will show up here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-gray-700">📖 My History ({history.length})</h2>
        <button
          onClick={onClearAll}
          className="text-sm font-bold text-red-400 hover:text-red-600 transition-colors"
        >
          Clear All
        </button>
      </div>
      {history.map((entry) => (
        <div
          key={entry.id}
          className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-5 hover:border-brand-blue transition-all group cursor-pointer"
          onClick={() => onSelect(entry)}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-gray-800 font-semibold text-lg truncate group-hover:text-brand-blue transition-colors">
                "{entry.inputText.length > 80 ? entry.inputText.slice(0, 80) + '...' : entry.inputText}"
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {new Date(entry.timestamp).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-2 truncate">
                🇨🇳 {entry.result.translation.length > 60 ? entry.result.translation.slice(0, 60) + '...' : entry.result.translation}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <SpeakerButton
                onClick={(e?: React.MouseEvent) => { e?.stopPropagation(); speakEnglish(entry.inputText); }}
                className="text-brand-blue hover:bg-blue-50"
              />
              <button
                onClick={(e?: React.MouseEvent) => { e?.stopPropagation(); onDelete(entry.id); }}
                className="text-gray-300 hover:text-red-400 transition-colors p-2"
                title="Delete"
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
  );
};

