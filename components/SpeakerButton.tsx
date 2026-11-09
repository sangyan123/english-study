import React from 'react';

export const SpeakerButton: React.FC<{ onClick: (e?: React.MouseEvent) => void; className?: string; label?: string }> = ({
  onClick,
  className = '',
  label = 'Read aloud',
}) => (
  <button
    onClick={onClick}
    title={label}
    aria-label={label}
    className={`inline-flex items-center justify-center rounded-full p-2 transition-all hover:scale-110 active:scale-95 ${className}`}
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  </button>
);

export const speakEnglish = (text: string) => {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.85;
  utterance.pitch = 1.1;
  const voices = window.speechSynthesis.getVoices();
  const enVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) || voices.find(v => v.lang.startsWith('en'));
  if (enVoice) utterance.voice = enVoice;
  window.speechSynthesis.speak(utterance);
};


