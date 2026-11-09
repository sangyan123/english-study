import React, { useState } from 'react';
import { QuizResult, QuizQuestion } from '../types';

interface Props {
  quiz: QuizResult | null;
  isLoading: boolean;
  onStart: () => void;
  onClose: () => void;
}

export const QuizPanel: React.FC<Props> = ({ quiz, isLoading, onStart, onClose }) => {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showResults, setShowResults] = useState(false);

  const questions: QuizQuestion[] = quiz?.questions ?? [];

  const handleStart = () => {
    setCurrent(0);
    setAnswers(new Array(questions.length).fill(null));
    setShowResults(false);
    onStart();
  };

  const handleAnswer = (index: number) => {
    const newAnswers = [...answers];
    newAnswers[current] = index;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else {
      setShowResults(true);
    }
  };

  const score = questions.reduce((acc, q, i) => (answers[i] === q.correctIndex ? acc + 1 : acc), 0);
  const scorePct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-8 text-center border-2 border-brand-blue/20">
        <div className="w-8 h-8 mx-auto border-4 border-brand-blue border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xl font-bold text-gray-500">Making your quiz... 🎯</p>
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-8 text-center border-2 border-brand-blue/20">
        <div className="text-5xl mb-4">🎯</div>
        <p className="text-xl font-bold text-gray-700 mb-2">Ready to test what you learned?</p>
        <p className="text-gray-500 mb-6">Take a fun quiz based on this sentence!</p>
        <button
          onClick={handleStart}
          className="px-8 py-3 bg-brand-blue text-white text-xl font-bold rounded-full shadow-lg hover:bg-blue-600 hover:-translate-y-1 transition-all"
        >
          Start Quiz! 🚀
        </button>
      </div>
    );
  }

  if (showResults) {
    const getMessage = () => {
      if (scorePct >= 80) return { emoji: '🏆', text: 'Amazing! You are a star!' };
      if (scorePct >= 60) return { emoji: '🌟', text: 'Great job! Keep it up!' };
      if (scorePct >= 40) return { emoji: '💪', text: 'Good effort! Try again!' };
      return { emoji: '📚', text: 'Keep learning, you can do it!' };
    };
    const msg = getMessage();
    return (
      <div className="bg-white rounded-3xl shadow-lg p-8 text-center border-2 border-brand-green/30">
        <div className="text-6xl mb-4">{msg.emoji}</div>
        <p className="text-3xl font-extrabold text-gray-800 mb-2">{score} / {questions.length}</p>
        <p className="text-xl font-bold text-brand-green mb-6">{msg.text}</p>
        <div className="space-y-3 text-left max-w-xl mx-auto mb-6">
          {questions.map((q, i) => {
            const isCorrect = answers[i] === q.correctIndex;
            return (
              <div key={i} className={`p-3 rounded-xl border-2 ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <p className="font-bold text-sm text-gray-700">
                  {isCorrect ? '✅' : '❌'} {i + 1}. {q.question}
                </p>
                {!isCorrect && (
                  <p className="text-sm text-gray-500 mt-1">
                    Answer: <strong>{q.options[q.correctIndex]}</strong> — {q.explanation}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={handleStart}
            className="px-6 py-2.5 bg-brand-blue text-white font-bold rounded-full hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-100 text-gray-600 font-bold rounded-full hover:bg-gray-200 transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  const q = questions[current];
  const answered = answers[current] !== null;
  const isCorrect = answers[current] === q.correctIndex;

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 border-2 border-brand-blue/20 space-y-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-gray-400">
          Question {current + 1} of {questions.length}
        </span>
        <button onClick={onClose} className="text-gray-300 hover:text-gray-500 transition-colors">
          ✕
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-blue rounded-full transition-all duration-300"
          style={{ width: `${((current + 1) / questions.length) * 100}%` }}
        />
      </div>

      <p className="text-xl font-bold text-gray-800 leading-relaxed">{q.question}</p>

      <div className="space-y-3">
        {q.options.map((opt, i) => {
          const isSelected = answers[current] === i;
          const isCorrectOpt = i === q.correctIndex;
          let cls = 'border-gray-200 hover:border-brand-blue hover:bg-blue-50';
          if (answered && isCorrectOpt) cls = 'border-green-300 bg-green-50';
          else if (answered && isSelected) cls = 'border-red-300 bg-red-50';
          else if (answered) cls = 'border-gray-100 opacity-50';

          return (
            <button
              key={i}
              onClick={() => !answered && handleAnswer(i)}
              disabled={answered}
              className={`w-full text-left p-4 rounded-2xl border-2 font-semibold text-gray-700 transition-all ${cls}`}
            >
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-sm font-bold mr-3">
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
              {answered && isCorrectOpt && <span className="ml-2">✅</span>}
              {answered && isSelected && !isCorrectOpt && <span className="ml-2">❌</span>}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className={`p-4 rounded-2xl border-2 ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
          <p className="font-bold text-sm mb-1">
            {isCorrect ? '🎉 Correct!' : '💡 Not quite!'}
          </p>
          <p className="text-sm text-gray-600">{q.explanation}</p>
        </div>
      )}

      {answered && (
        <button
          onClick={handleNext}
          className="w-full py-3 bg-brand-blue text-white text-lg font-bold rounded-full hover:bg-blue-600 transition-colors"
        >
          {current < questions.length - 1 ? 'Next Question →' : 'See Results 🏆'}
        </button>
      )}
    </div>
  );
};

