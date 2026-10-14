import React from 'react';

interface MicButtonProps {
  recording: boolean;
  onStart: () => void;
  onStop: () => void;
  title?: string;
}

function MicIcon() {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

export const MicButton: React.FC<MicButtonProps> = ({ recording, onStart, onStop, title }) => (
  <button
    type="button"
    className={`btn-mic ${recording ? 'recording' : ''}`}
    aria-pressed={recording}
    aria-label={recording ? 'Остановить запись' : 'Записать голосом'}
    title={title || (recording ? 'Остановить' : 'Говорить')}
    onClick={() => (recording ? onStop() : onStart())}
  >
    {recording ? <StopIcon /> : <MicIcon />}
  </button>
);
