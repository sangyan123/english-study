import { useState, useCallback, useEffect, useRef } from 'react';

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: { [key: number]: { [key: number]: { transcript: string }; isFinal: boolean; length: number } };
}

export function useVoiceInput(onResult: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[event.resultIndex][0].transcript;
      onResult(transcript);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    return () => {
      recognition.abort();
    };
  }, [onResult]);

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const isSupported = typeof window !== 'undefined' &&
    ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  return { isListening, startListening, stopListening, isSupported: !!isSupported };
}
