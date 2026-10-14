import React from 'react';

export const FieldHint: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p style={{ margin: '4px 0 0', fontSize: '11px', lineHeight: 1.4, color: 'var(--text-muted)' }}>
    {children}
  </p>
);
