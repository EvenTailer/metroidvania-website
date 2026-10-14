import React, { useEffect } from 'react';

export interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title = 'Подтверждение действия',
  message,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  danger = true,
  onConfirm,
  onClose
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        background: 'rgba(5, 8, 16, 0.78)',
        backdropFilter: 'blur(8px)'
      }}
    >
      <div
        className="modal"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '440px',
          width: '92%',
          background: 'linear-gradient(180deg, #0e1726 0%, #080c14 100%)',
          border: danger ? '1px solid rgba(239, 68, 68, 0.45)' : '1px solid rgba(0, 210, 255, 0.35)',
          boxShadow: danger
            ? '0 12px 35px rgba(0,0,0,0.8), 0 0 24px rgba(239,68,68,0.2)'
            : '0 12px 35px rgba(0,0,0,0.8), 0 0 24px rgba(0,210,255,0.2)',
          borderRadius: '12px',
          padding: '20px 24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              background: danger ? 'rgba(239, 68, 68, 0.15)' : 'rgba(0, 210, 255, 0.15)',
              border: `1px solid ${danger ? 'rgba(239, 68, 68, 0.35)' : 'rgba(0, 210, 255, 0.35)'}`,
              flexShrink: 0
            }}
          >
            {danger ? '🗑️' : '⚠️'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#fff', letterSpacing: '0.02em' }}>
              {title}
            </h3>
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>

        <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '22px' }}>
          {message}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            style={{ padding: '7px 16px', fontSize: '12.5px' }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={{
              padding: '7px 18px',
              fontSize: '12.5px',
              fontWeight: 700,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              color: '#ffffff',
              background: danger
                ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)'
                : 'linear-gradient(135deg, #00d2ff 0%, #0284c7 100%)',
              boxShadow: danger
                ? '0 4px 14px rgba(239, 68, 68, 0.4)'
                : '0 4px 14px rgba(0, 210, 255, 0.4)'
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
