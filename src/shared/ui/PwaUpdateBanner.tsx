import React from 'react';
import './pwa-update.css';

interface PwaUpdateBannerProps {
  onApply: () => void;
}

export const PwaUpdateBanner: React.FC<PwaUpdateBannerProps> = ({ onApply }) => (
  <div className="pwa-update-banner" role="status">
    <span>Доступна новая версия хаба.</span>
    <button type="button" className="btn btn-cyan" onClick={onApply}>
      Обновить
    </button>
  </div>
);
