import React, { useState } from 'react';
import { analyzeText } from './services/geminiService';
import { AnalysisResult, AppState } from './types';
import { MagicWandIcon, BookIcon, StarIcon, TranslateIcon, DownloadIcon, PrinterIcon } from './components/Icons';

declare var html2pdf: any;

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;

    setAppState(AppState.ANALYZING);
    setResult(null);

    try {
      const data = await analyzeText(inputText);
      setResult(data);
      setAppState(AppState.SUCCESS);
    } catch (error) {
      console.error(error);
      setAppState(AppState.ERROR);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
        handleAnalyze();
    }
  }

  const handleDownloadText = () => {
    if (!result) return;
    
    const textContent = `English Explorer Analysis\n=========================\n\n` +
      `Original Text:\n${inputText}\n\n` +
      `Chinese Meaning:\n${result.translation}\n\n` +
      `Cool Phrases:\n${result.phrases.map(p => `- ${p.text} (${p.type}): ${p.meaning}`).join('\n')}\n\n` +
      `Grammar Notes:\n${result.grammarPoints.map((g, i) => `${i+1}. ${g.rule}: ${g.explanation}`).join('\n')}\n\n` +
      `Message: ${result.encouragement}`;

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'english-explorer-analysis.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('analysis-result-container');
    if (!element) return;

    setIsPdfGenerating(true);
    
    // Configuration to ensure complete content capture and proper page breaks
    const opt = {
      margin:       [0.5, 0.5, 0.5, 0.5], // Top, Left, Bottom, Right
      filename:     'english-explorer-analysis.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { 
        scale: 2, 
        useCORS: true, 
        logging: false,
        scrollY: 0, // Critical: prevent offset issues if user has scrolled down
        windowWidth: document.documentElement.offsetWidth // Ensure full width is captured
      },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' },
      pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] } // Avoid cutting elements in half
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error("PDF generation failed", err);
      alert("Could not generate PDF. Please try again.");
    } finally {
      setIsPdfGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 font-sans text-gray-800 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-full shadow-md mb-2">
             <span className="text-4xl mr-2">🏰</span>
             <h1 className="text-3xl md:text-4xl font-extrabold text-brand-blue tracking-tight">
               English Explorer
             </h1>
          </div>
          <p className="text-gray-600 font-semibold text-lg">
            Let's explore the magic of English sentences! ✨
          </p>
        </header>

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
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleAnalyze}
              disabled={appState === AppState.ANALYZING || !inputText.trim()}
              className={`
                flex items-center gap-2 px-8 py-3 rounded-full text-xl font-bold text-white shadow-lg transition-all duration-200
                ${appState === AppState.ANALYZING 
                  ? 'bg-gray-400 cursor-not-allowed translate-y-0' 
                  : 'bg-brand-red hover:bg-red-500 hover:-translate-y-1 active:translate-y-0 shadow-red-200'}
              `}
            >
              {appState === AppState.ANALYZING ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 text-center text-red-600 font-bold animate-bounce">
            Oops! The magic fizzled out. Please try again later! 🪄💥
          </div>
        )}

        {/* Results Section */}
        {appState === AppState.SUCCESS && result && (
          <div className="space-y-6 animate-fade-in-up">
            
            {/* Encouragement Banner */}
            <div className="bg-brand-yellow/20 border-2 border-brand-yellow rounded-2xl p-4 text-center">
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
                 Save as Text
               </button>
               <button 
                 onClick={handleDownloadPDF}
                 disabled={isPdfGenerating}
                 className={`
                   flex items-center gap-2 px-4 py-2 bg-white text-gray-600 font-bold rounded-xl shadow-sm border-2 border-gray-100 
                   hover:border-brand-blue hover:text-brand-blue transition-colors
                   ${isPdfGenerating ? 'opacity-50 cursor-wait' : ''}
                 `}
               >
                 {isPdfGenerating ? (
                   <div className="w-5 h-5 border-2 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
                 ) : (
                   <PrinterIcon className="w-5 h-5" />
                 )}
                 {isPdfGenerating ? 'Saving...' : 'Save as PDF'}
               </button>
            </div>

            {/* Analysis Container - Target for PDF Generation */}
            <div id="analysis-result-container" className="space-y-6 p-1">
              
              {/* Original Text Display */}
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm break-inside-avoid">
                  <h3 className="text-lg font-bold text-gray-400 mb-2 uppercase tracking-wide">Original Text</h3>
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
                  <p className="text-2xl text-gray-800 font-medium leading-relaxed">
                    {result.translation}
                  </p>
                </div>

                {/* Phrases Card */}
                <div className="bg-white rounded-3xl shadow-lg border-b-4 border-brand-green p-6 relative overflow-hidden">
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-green-100 rounded-full opacity-50 blur-xl"></div>
                  <h3 className="text-xl font-bold text-brand-green mb-4 flex items-center gap-2">
                    <StarIcon className="w-6 h-6" />
                    Cool Phrases
                  </h3>
                  {result.phrases.length > 0 ? (
                    <ul className="space-y-3">
                      {result.phrases.map((phrase, idx) => (
                        <li key={idx} className="bg-green-50 rounded-xl p-3 border border-green-100 break-inside-avoid">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-lg text-green-800">{phrase.text}</span>
                            <span className="text-xs px-2 py-0.5 bg-white text-green-600 rounded-full font-bold border border-green-200">
                              {phrase.type}
                            </span>
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
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-100 rounded-full opacity-50 blur-xl"></div>
                  <h3 className="text-xl font-bold text-yellow-600 mb-4 flex items-center gap-2">
                    <BookIcon className="w-6 h-6" />
                    Grammar Check
                  </h3>
                  {result.grammarPoints.length > 0 ? (
                    <div className="space-y-4">
                      {result.grammarPoints.map((point, idx) => (
                        <div key={idx} className="group break-inside-avoid">
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="w-6 h-6 flex items-center justify-center bg-yellow-200 text-yellow-800 rounded-full text-sm font-bold shrink-0">
                              {idx + 1}
                            </span>
                            <h4 className="font-bold text-gray-800">{point.rule}</h4>
                          </div>
                          <p className="text-gray-600 pl-8 leading-relaxed">
                            {point.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">This looks like a simple sentence grammatically!</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
      
      {/* Decorative Background Elements */}
      <div className="fixed top-20 left-10 text-6xl opacity-20 -z-10 animate-pulse hidden xl:block">☁️</div>
      <div className="fixed bottom-20 right-10 text-6xl opacity-20 -z-10 animate-bounce hidden xl:block">🐇</div>
      <div className="fixed bottom-40 left-20 text-4xl opacity-10 -z-10 rotate-12 hidden xl:block">🍄</div>
    </div>
  );
};

export default App;