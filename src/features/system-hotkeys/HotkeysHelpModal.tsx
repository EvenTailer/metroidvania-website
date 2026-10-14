import React from 'react';
import { playCyberClick } from '../../shared/lib/cyberSound';
import { useDialog } from '../../shared/lib/useDialog';
import '../../shared/ui/hub-dialog.css';
import { HOTKEY_SECTIONS } from './hotkeyHelpCopy';
import './hotkeys-help.css';

interface HotkeysHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HotkeysHelpModal: React.FC<HotkeysHelpModalProps> = ({ isOpen, onClose }) => {
  const panelRef = useDialog(isOpen);
  if (!isOpen) return null;

  return (
    <div className="hub-dialog-backdrop hub-dialog-backdrop--hotkeys" onClick={onClose}>
      <div
        ref={panelRef}
        className="hotkeys-help"
        role="dialog"
        aria-modal="true"
        aria-labelledby="hotkeys-help-title"
        data-hub-dialog="open"
        onClick={event => event.stopPropagation()}
      >
        <div className="hotkeys-help-head">
          <div>
            <h3 id="hotkeys-help-title" className="hotkeys-help-title">Горячие клавиши хаба</h3>
            <p className="hotkeys-help-subtitle">Окна блокируют цифры, G и M, пока вы их не закроете</p>
          </div>
          <button type="button" className="icon-btn" onClick={() => { playCyberClick(); onClose(); }} aria-label="Закрыть">
            ✕
          </button>
        </div>

        <div className="hotkeys-help-body">
          {HOTKEY_SECTIONS.map(section => (
            <section key={section.title}>
              <div className="hotkeys-help-section-title">
                <span aria-hidden="true">{section.icon}</span>
                <span>{section.title}</span>
              </div>
              <div className="hotkeys-help-grid">
                {section.items.map(item => (
                  <div key={item.description} className="hotkeys-help-row">
                    <div>
                      <div className="hotkeys-help-label">{item.description}</div>
                      {item.hint && <div className="hotkeys-help-hint">{item.hint}</div>}
                    </div>
                    <div className="hotkeys-help-keys">
                      {item.keys.map(key => <kbd key={key}>{key}</kbd>)}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="hotkeys-help-foot">
          <span>Цифры 1–0 переключают разделы, пока не открыто окно и курсор не в поле ввода.</span>
          <button
            type="button"
            className="btn btn-primary hotkeys-help-ok"
            onClick={() => { playCyberClick(); onClose(); }}
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
};
