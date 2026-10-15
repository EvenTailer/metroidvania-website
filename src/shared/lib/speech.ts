declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function speechSupported(): boolean {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

function joinSpeech(parts: string[], interim: string): string {
  return [...parts, interim].map(part => part.trim()).filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

export function startSpeechRecognition(
  onFinal: (text: string) => void,
  onError?: (err: unknown) => void,
  onEnd?: () => void,
  onInterim?: (text: string) => void
): (() => void) | null {
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRec) return null;

  const isIos = typeof navigator !== 'undefined' && (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );

  let userStopped = false;
  let finished = false;
  let rec: any = null;
  const parts: string[] = [];
  let interim = '';

  const finish = () => {
    if (finished) return;
    finished = true;
    const text = joinSpeech(parts, interim);
    interim = '';
    if (text) onFinal(text);
    if (onEnd) onEnd();
  };

  const attach = () => {
    rec = new SpeechRec();
    rec.lang = 'ru-RU';
    rec.continuous = !isIos; // iOS Safari throws or cancels if continuous is true
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onresult = (event: any) => {
      let nextInterim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const item = event.results[i];
        if (!item || !item[0]) continue;
        const chunk = item[0].transcript as string;
        if (item.isFinal) parts.push(chunk.trim());
        else nextInterim += chunk;
      }
      interim = nextInterim.trim();
      if (onInterim) onInterim(joinSpeech(parts, interim));
    };

    rec.onerror = (event: any) => {
      const code = event?.error;
      if (code === 'aborted' || code === 'no-speech') return;
      userStopped = true;
      if (onError) onError(event);
    };

    rec.onend = () => {
      if (!userStopped && !isIos) {
        try {
          attach();
          rec.start();
          return;
        } catch {
          /* browser refused to continue */
        }
      }
      finish();
    };
  };

  try {
    attach();
    rec.start();
  } catch (err) {
    console.warn('[Speech] Start failed:', err);
    return null;
  }

  return () => {
    userStopped = true;
    try {
      rec.stop();
    } catch {
      finish();
    }
  };
}
