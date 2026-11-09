import React, { useState, useEffect } from 'react';
import { analyzeText, generateQuiz } from './services/geminiService';
import {
  getHistory, saveToHistory, deleteHistoryItem, clearHistory,
  getVocab, toggleVocab, removeVocab, clearVocab,
} from './services/storage';
import { AnalysisResult, AppState, HistoryEntry, QuizResult, VocabEntry } from './types';
import { MagicWandIcon, BookIcon, StarIcon, TranslateIcon, DownloadIcon, PrinterIcon } from './components/Icons';
import { SpeakerButton, speakEnglish } from './components/SpeakerButton';
import { HistoryPanel } from './components/HistoryPanel';
import { VocabPanel } from './components/VocabPanel';
import { QuizPanel } from './components/QuizPanel';
import { useVoiceInput } from './hooks/useVoiceInput';
import html2pdf from 'html2pdf.js';

type ViewTab = 'analyze' | 'history' | 'vocab';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [currentView, setCurrentView] = useState<ViewTab>('analyze');
  const [quiz, setQuiz] = useState<QuizResult | null>(null);
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [vocab, setVocab] = useState<VocabEntry[]>([]);

  const { isListening, startListening, stopListening, isSupported: isVoiceSupported } = useVoiceInput(
    (text) => { setInputText((prev) => (prev ? prev + ' ' + text : text)); }
  );

  useEffect(() => {
    setHistory(getHistory());
    setVocab(getVocab());
  }, []);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setAppState(AppState.ANALYZING);
    setResult(null);
    setQuiz(null);
    try {
      const data = await analyzeText(inputText);
      setResult(data);
      setAppState(AppState.SUCCESS);
      saveToHistory(inputText, data);
      setHistory(getHistory());
    } catch (error) {
      console.error(error);
      setAppState(AppState.ERROR);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAnalyze();
  };

  const handleHistorySelect = (entry: HistoryEntry) => {
    setInputText(entry.inputText);
    setResult(entry.result);
    setQuiz(null);
    setAppState(AppState.SUCCESS);
    setCurrentView('analyze');
  };

  const handleDeleteHistory = (id: string) => {
    deleteHistoryItem(id);
    setHistory(getHistory());
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  const handleToggleVocab = (phrase: { text: string; meaning: string; type: string }) => {
    toggleVocab(phrase, inputText);
    setVocab(getVocab());
  };

  const handleRemoveVocab = (phraseText: string) => {
    removeVocab(phraseText);
    setVocab(getVocab());
  };

  const handleClearVocab = () => {
    clearVocab();
    setVocab([]);
  };

  const handleStartQuiz = async () => {
    if (!result || !inputText.trim()) return;
    setIsQuizLoading(true);
    try {
      const data = await generateQuiz(inputText, result);
      setQuiz(data);
    } catch (err) {
      console.error('Quiz generation error:', err);
    } finally {
      setIsQuizLoading(false);
    }
  };

  const handleDownloadText = () => {
    if (!result) return;
    const lines = [
      'English Explorer Analysis',
      '=========================',
      '',
      'Original Text:',
      inputText,
      '',
      'Chinese Meaning:',
      result.translation,
      '',
      'Cool Phrases:',
      ...result.phrases.map((p) => '- ' + p.text + ' (' + p.type + '): ' + p.meaning),
      '',
      'Grammar Notes:',
      ...result.grammarPoints.map((g, i) => (i + 1) + '. ' + g.rule + ': ' + g.explanation),
      '',
      'Message: ' + result.encouragement,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'english-explorer-analysis.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = async () => {
    const element = document.getElementById('analysis-result-container');
    if (!element) return;
    setIsPdfGenerating(true);
    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5] as [number, number, number, number],
      filename: 'english-explorer-analysis.pdf',
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        scrollY: 0,
        windowWidth: document.documentElement.offsetWidth,
      },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    };
    try {
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('PDF generation failed', err);
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const isVocabSaved = (phraseText: string) => vocab.some((v) => v.phrase.text === phraseText);

  const tabs: { id: ViewTab; label: string; icon: string; badge?: number }[] = [
    { id: 'analyze', label: 'Analyze', icon: '🪄' },
    { id: 'history', label: 'History', icon: '📖', badge: history.length || undefined },
    { id: 'vocab', label: 'Vocab Book', icon: '⭐', badge: vocab.length || undefined },
  ];

  const micButtonClass = isListening
    ? 'bg-red-100 text-red-500 animate-pulse'
    : 'text-brand-green hover:bg-green-50';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 text-gray-800 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <header className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-full shadow-md mb-2">
            <span className="text-4xl mr-2">🏰</span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-brand-blue tracking-tight">English Explorer</h1>
          </div>
          <p className="text-gray-600 font-semibold text-lg">Let us explore the magic of English sentences! ✨</p>
        </header>

        {/* Tab Navigation */}
        <nav className="flex gap-2 bg-white rounded-full p-1.5 shadow-md max-w-md mx-auto print:hidden">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentView(tab.id)}
              className={'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-sm font-bold transition-all ' + (currentView === tab.id ? 'bg-brand-blue text-white shadow' : 'text-gray-500 hover:bg-gray-50')}
            >
              <span>{tab.icon}</span>
              {tab.label}
              {tab.badge !== undefined && (
                <span className={'text-xs px-1.5 py-0.5 rounded-full ' + (currentView === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400')}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* === ANALYZE VIEW === */}
        {currentView === 'analyze' && (
          <div className="space-y-8">

            {/* Input Section */}
            <section className="bg-white rounded-3xl shadow-xl p-6 border-4 border-white ring-4 ring-blue-100 transition-transform duration-300 hover:scale-[1.01] print:hidden">
              <label htmlFor="english-input" className="block text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
                <BookIcon className="w-6 h-6 text-brand-green" />
                Paste your sentence here:
              </label>
              <textarea
                id="english-input"
                className="w-full h-32 p-4 text-lg md:text-xl rounded-2xl border-2 border-gray-200 focus:border-brand-blue focus:ring-4 focus:ring-blue-100 outline-none resize-none bg-paper-white placeholder-gray-400"
                placeholder="e.g. Once upon a time, there was a brave little rabbit..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isVoiceSupported && (
                    <button
                      onClick={isListening ? stopListening : startListening}
                      title={isListening ? 'Stop listening' : 'Speak in English'}
                      className={'inline-flex items-center justify-center rounded-full p-2 transition-all hover:scale-110 active:scale-95 ' + micButtonClass}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                        <line x1="12" x2="12" y1="19" y2="22" />
                      </svg>
                    </button>
                  )}
                  {inputText.trim() && (
                    <SpeakerButton
                      onClick={() => speakEnglish(inputText)}
                      className="text-brand-green hover:bg-green-50"
                      label="Read my sentence"
                    />
                  )}
                </div>
                <button
                  onClick={handleAnalyze}
                  disabled={appState === AppState.ANALYZING || !inputText.trim()}
                  className={'flex items-center gap-2 px-8 py-3 rounded-full text-xl font-bold text-white shadow-lg transition-all duration-200 ' + (appState === AppState.ANALYZING ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-red hover:bg-red-500 hover:-translate-y-1 active:translate-y-0 shadow-red-200')}
                >
                  {appState === AppState.ANALYZING ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Thinking...
                    </>
                  ) : (
                    <>
                      <MagicWandIcon className="w-6 h-6" />
                      Magic Analyze!
                    </>
                  )}
                </button>
              </div>
            </section>

            {/* Error State */}
            {appState === AppState.ERROR && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 text-center text-red-600 font-bold animate-bounce print:hidden">
                Oops! The magic fizzled out. Please try again later! 🪄💥
              </div>
            )}

            {/* Results Section */}
            {appState === AppState.SUCCESS && result && (
              <div className="space-y-6 animate-fade-in-up">

                {/* Encouragement Banner */}
                <div className="bg-brand-yellow/20 border-2 border-brand-yellow rounded-2xl p-4 text-center print:hidden">
                  <span className="text-2xl mr-2">🌟</span>
                  <span className="text-xl font-bold text-yellow-800">{result.encouragement}</span>
                </div>

                {/* Export Toolbar */}
                <div className="flex justify-end gap-3 print:hidden">
                  <button
                    onClick={handleDownloadText}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-gray-600 font-bold rounded-xl shadow-sm border-2 border-gray-100 hover:border-brand-blue hover:text-brand-blue transition-colors"
                  >
                    <DownloadIcon className="w-5 h-5" />
                    Save Text
                  </button>
                  <button
                    onClick={handleDownloadPdf}
                    disabled={isPdfGenerating}
                    className={'flex items-center gap-2 px-4 py-2 bg-white text-gray-600 font-bold rounded-xl shadow-sm border-2 border-gray-100 hover:border-brand-blue hover:text-brand-blue transition-colors ' + (isPdfGenerating ? 'opacity-50 cursor-wait' : '')}
                  >
                    {isPdfGenerating ? (
                      <div className="w-5 h-5 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <PrinterIcon className="w-5 h-5" />
                    )}
                    {isPdfGenerating ? 'Saving...' : 'Save as PDF'}
                  </button>
                </div>

                {/* Analysis Container */}
                <div id="analysis-result-container" className="space-y-6 p-1">

                  {/* Original Text */}
                  <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm break-inside-avoid">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-400 uppercase tracking-wide">Original Text</h3>
                      <SpeakerButton
                        onClick={() => speakEnglish(inputText)}
                        className="text-brand-blue hover:bg-blue-50"
                        label="Read original text"
                      />
                    </div>
                    <p className="text-xl text-gray-800 font-medium font-serif italic border-l-4 border-gray-300 pl-4">
                      "{inputText}"
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">

                    {/* Translation Card */}
                    <div className="md:col-span-2 bg-white rounded-3xl shadow-lg border-b-4 border-brand-blue p-6 relative overflow-hidden group break-inside-avoid">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TranslateIcon className="w-24 h-24 text-brand-blue" />
                      </div>
                      <h3 className="text-xl font-bold text-brand-blue mb-3 flex items-center gap-2">
                        <TranslateIcon className="w-6 h-6" />
                        Chinese Meaning
                      </h3>
                      <p className="text-2xl text-gray-800 font-medium leading-relaxed">{result.translation}</p>
                    </div>

                    {/* Phrases Card */}
                    <div className="bg-white rounded-3xl shadow-lg border-b-4 border-brand-green p-6 relative overflow-hidden">
                      <div className="absolute -top-4 -right-4 w-24 h-24 bg-green-100 rounded-full opacity-50 blur-xl" />
                      <h3 className="text-xl font-bold text-brand-green mb-4 flex items-center gap-2">
                        <StarIcon className="w-6 h-6" />
                        Cool Phrases
                      </h3>
                      {result.phrases.length > 0 ? (
                        <ul className="space-y-3">
                          {result.phrases.map((phrase, idx) => (
                            <li key={idx} className="bg-green-50 rounded-xl p-3 border border-green-100 break-inside-avoid">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <div className="flex items-center gap-2 flex-wrap min-w-0">
                                  <span className="font-bold text-lg text-green-800">{phrase.text}</span>
                                  <span className="text-xs px-2 py-0.5 bg-white text-green-600 rounded-full font-bold border border-green-200">
                                    {phrase.type}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <SpeakerButton
                                    onClick={() => speakEnglish(phrase.text)}
                                    className="text-green-500 hover:bg-green-100"
                                    label={'Read ' + phrase.text}
                                  />
                                  <button
                                    onClick={() => handleToggleVocab(phrase)}
                                    title={isVocabSaved(phrase.text) ? 'Remove from vocab book' : 'Save to vocab book'}
                                    className={'p-1.5 rounded-full transition-all hover:scale-110 ' + (isVocabSaved(phrase.text) ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400')}
                                  >
                                    <svg viewBox="0 0 24 24" fill={isVocabSaved(phrase.text) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                              <p className="text-gray-600">{phrase.meaning}</p>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 italic">No specific phrases found in this short text.</p>
                      )}
                    </div>

                    {/* Grammar Card */}
                    <div className="bg-white rounded-3xl shadow-lg border-b-4 border-brand-yellow p-6 relative overflow-hidden">
                      <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-100 rounded-full opacity-50 blur-xl" />
                      <h3 className="text-xl font-bold text-yellow-600 mb-4 flex items-center gap-2">
                        <BookIcon className="w-6 h-6" />
                        Grammar Check
                      </h3>
                      {result.grammarPoints.length > 0 ? (
                        <div className="space-y-4">
                          {result.grammarPoints.map((point, idx) => (
                            <div key={idx} className="break-inside-avoid">
                              <div className="flex items-baseline gap-2 mb-1">
                                <span className="w-6 h-6 flex items-center justify-center bg-yellow-200 text-yellow-800 rounded-full text-sm font-bold shrink-0">
                                  {idx + 1}
                                </span>
                                <h4 className="font-bold text-gray-800">{point.rule}</h4>
                              </div>
                              <p className="text-gray-600 pl-8 leading-relaxed">{point.explanation}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">This sentence is grammar-perfect! 🎉</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quiz Section */}
                <div className="print:hidden">
                  <QuizPanel
                    quiz={quiz}
                    isLoading={isQuizLoading}
                    onStart={handleStartQuiz}
                    onClose={() => setQuiz(null)}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* === HISTORY VIEW === */}
        {currentView === 'history' && (
          <HistoryPanel
            history={history}
            onSelect={handleHistorySelect}
            onDelete={handleDeleteHistory}
            onClearAll={handleClearHistory}
          />
        )}

        {/* === VOCAB VIEW === */}
        {currentView === 'vocab' && (
          <VocabPanel
            vocab={vocab}
            onRemove={handleRemoveVocab}
            onClearAll={handleClearVocab}
          />
        )}

        {/* Footer */}
        <footer className="text-center text-gray-400 text-sm py-4 print:hidden">
          Made with 💙 for young English explorers
        </footer>
      </div>
    </div>
  );
};

export default App;


