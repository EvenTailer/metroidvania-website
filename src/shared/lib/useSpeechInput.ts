import { useRef, useState } from 'react';
import { speechSupported, startSpeechRecognition } from './speech';

interface SpeechHandlers {
  onFinal: (text: string) => void;
  onInterim?: (text: string) => void;
  onEnd?: () => void;
}

export function useSpeechInput(onToast: (msg: string) => void) {
  const stopRef = useRef<(() => void) | null>(null);
  const [recording, setRecording] = useState(false);

  const stop = () => {
    stopRef.current?.();
    stopRef.current = null;
    setRecording(false);
  };

  const start = (handlers: SpeechHandlers) => {
    if (stopRef.current) return;

    const handle = startSpeechRecognition(
      (text) => {
        handlers.onFinal(text);
      },
      () => {
        stopRef.current = null;
        setRecording(false);
        onToast('Микрофон недоступен. Разрешите доступ или введите текст.');
        handlers.onEnd?.();
      },
      () => {
        stopRef.current = null;
        setRecording(false);
        handlers.onEnd?.();
      },
      handlers.onInterim
    );

    if (!handle) {
      onToast('Голос недоступен в этом браузере. Наберите текст.');
      return;
    }

    stopRef.current = handle;
    setRecording(true);
  };

  return { recording, start, stop, supported: speechSupported() };
}
