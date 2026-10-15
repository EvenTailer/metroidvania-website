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
      if (typeof window !== 'undefined' && !window.isSecureContext) {
        onToast('Микрофон требует HTTPS (SSL). Включите сертификат на хостинге или используйте диктовку на клавиатуре.');
      } else {
        onToast('Голос недоступен в этом браузере. Наберите текст или используйте диктовку на клавиатуре.');
      }
      return;
    }

    stopRef.current = handle;
    setRecording(true);
  };

  return { recording, start, stop, supported: speechSupported() };
}
