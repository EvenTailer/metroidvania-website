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
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (event: any) => {
      let nextInterim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const chunk = event.results[i][0].transcript as string;
        if (event.results[i].isFinal) parts.push(chunk.trim());
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
      if (!userStopped) {
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

  attach();
  try {
    rec.start();
  } catch {
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
