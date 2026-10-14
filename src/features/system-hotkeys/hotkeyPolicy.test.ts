import { describe, expect, it } from 'vitest';
import { NUMBER_KEY_VIEWS } from '../../shared/config/views';
import { resolveHotkey } from './hotkeyPolicy';
import { NUMBER_HOTKEY_COPY } from './hotkeyHelpCopy';

const idle = { ctrlKey: false, metaKey: false, altKey: false, shiftKey: false, typing: false };

describe('горячие клавиши', () => {
  it('держит цифры и буквы из одного списка, что и шпаргалка', () => {
    expect(Object.keys(NUMBER_HOTKEY_COPY)).toEqual(Object.keys(NUMBER_KEY_VIEWS));
  });

  it('открывает палитру и не трогает шорткаты поверх окна или поля ввода', () => {
    expect(resolveHotkey({ ...idle, key: 'k', ctrlKey: true }, false)).toEqual({ type: 'palette' });
    expect(resolveHotkey({ ...idle, key: 'л', ctrlKey: true }, true)).toEqual({ type: 'palette' });
    expect(resolveHotkey({ ...idle, key: 'g' }, true)).toBeNull();
    expect(resolveHotkey({ ...idle, key: '1', typing: true }, false)).toBeNull();
    expect(resolveHotkey({ ...idle, key: 'Escape', typing: true }, false)).toEqual({ type: 'close' });
    expect(resolveHotkey({ ...idle, key: 'g' }, false)).toEqual({ type: 'glossary' });
    expect(resolveHotkey({ ...idle, key: 'п' }, false)).toEqual({ type: 'glossary' });
    expect(resolveHotkey({ ...idle, key: 'm' }, false)).toEqual({ type: 'mute' });
    expect(resolveHotkey({ ...idle, key: 'ь' }, false)).toEqual({ type: 'mute' });
    expect(resolveHotkey({ ...idle, key: '?' }, false)).toEqual({ type: 'help' });
    expect(resolveHotkey({ ...idle, key: '5' }, false)).toEqual({ type: 'view', view: 'room-matrix' });
    expect(resolveHotkey({ ...idle, key: '0' }, false)).toEqual({ type: 'view', view: 'engine-bridge' });
  });
});
