import { useEffect } from 'react';
import { playCyberBlip } from '../../shared/lib/cyberSound';
import { isTypingTarget } from '../../shared/lib/isTypingTarget';
import { resolveHotkey } from './hotkeyPolicy';
import { ViewType } from '../../shared/config/views';

interface GlobalHotkeysOptions {
  blockAppShortcuts: boolean;
  onToggleCommandPalette: () => void;
  onOpenHotkeysModal: () => void;
  onOpenGlossaryModal: () => void;
  onToggleSoundMute: () => void;
  onCloseModals: () => void;
  onCloseSidebar: () => void;
  onSelectView: (view: ViewType) => void;
}

export function useGlobalHotkeys({
  blockAppShortcuts,
  onToggleCommandPalette,
  onOpenHotkeysModal,
  onOpenGlossaryModal,
  onToggleSoundMute,
  onCloseModals,
  onCloseSidebar,
  onSelectView
}: GlobalHotkeysOptions) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const command = resolveHotkey({
        key: event.key,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        altKey: event.altKey,
        shiftKey: event.shiftKey,
        typing: isTypingTarget(event.target)
      }, blockAppShortcuts);
      if (!command) return;

      if (command.type === 'close') {
        if (blockAppShortcuts) {
          event.preventDefault();
          onCloseModals();
        } else if (!isTypingTarget(event.target)) {
          onCloseSidebar();
        }
        return;
      }

      event.preventDefault();
      if (command.type === 'palette') onToggleCommandPalette();
      else if (command.type === 'help') {
        playCyberBlip();
        onOpenHotkeysModal();
      } else if (command.type === 'glossary') {
        playCyberBlip();
        onOpenGlossaryModal();
      } else if (command.type === 'mute') onToggleSoundMute();
      else if (command.type === 'view') {
        playCyberBlip();
        onSelectView(command.view);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    blockAppShortcuts,
    onToggleCommandPalette,
    onOpenHotkeysModal,
    onOpenGlossaryModal,
    onToggleSoundMute,
    onCloseModals,
    onCloseSidebar,
    onSelectView
  ]);
}
