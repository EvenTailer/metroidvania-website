import React, { useState } from 'react';

interface AuthModalProps {
  onLogin: (authorIndex: number) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleVerify = () => {
    setError(null);
    const p = password.trim();
    if (p === '1111') {
      onLogin(0);
    } else if (p === '2222') {
      onLogin(1);
    } else if (p === '3333') {
      onLogin(2);
    } else if (p === '2026') {
      onLogin(0);
    } else {
      setError('Неверный код доступа. Введите верный пароль.');
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-card">
        <div className="duck-avatar-logo" />
        <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '22px', fontWeight: 800, color: '#fff', letterSpacing: '1px', marginBottom: '4px' }}>
          CYBER-DUCK NEXUS
        </h2>
        <p style={{ fontSize: '12px', color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700, marginBottom: '24px' }}>
          Закрытый хаб разработки игры
        </p>

        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Для входа введите персональный пароль доступа:
        </p>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <input
            type="password"
            className="field"
            style={{ flex: 1, textAlign: 'center', fontSize: '18px', letterSpacing: '3px' }}
            placeholder="••••"
            maxLength={10}
            autoFocus
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleVerify(); }}
          />
          <button className="btn btn-primary" onClick={handleVerify}>
            Войти →
          </button>
        </div>

        {error && (
          <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px', fontWeight: 600 }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
};
