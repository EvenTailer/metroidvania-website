import { describe, expect, it } from 'vitest';
import { isSoundMuted, setSoundMuted, playCyberClick, playCyberSuccess, playCyberBlip } from './cyberSound';

describe('cyberSound audio system', () => {
  it('переключает и сохраняет состояние звука', () => {
    setSoundMuted(true);
    expect(isSoundMuted()).toBe(true);

    setSoundMuted(false);
    expect(isSoundMuted()).toBe(false);
  });

  it('безопасно вызывает функции звуков без выброса ошибок в node/jsdom', () => {
    expect(() => {
      playCyberClick();
      playCyberSuccess();
      playCyberBlip();
    }).not.toThrow();
  });
});
