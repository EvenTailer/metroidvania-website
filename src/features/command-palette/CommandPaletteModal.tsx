import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CommandCategory, COMMAND_CATEGORY_TITLES, CommandPaletteItem } from './types';
import { playCyberBlip, playCyberClick } from '../../shared/lib/cyberSound';
import { useDialog } from '../../shared/lib/useDialog';
import '../../shared/ui/hub-dialog.css';
import { filterCommandItems } from './useCommandPaletteItems';
import './command-palette.css';

interface CommandPaletteModalProps {
  isOpen: boolean;
  items: CommandPaletteItem[];
  onClose: () => void;
}

const CATEGORIES: CommandCategory[] = ['actions', 'views', 'rooms', 'enemies', 'builds'];

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({ isOpen, items, onClose }) => {
  const panelRef = useDialog(isOpen);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setQuery('');
    setSelectedIndex(0);
    playCyberClick();
  }, [isOpen]);

  const filteredItems = useMemo(() => filterCommandItems(items, query), [items, query]);

  const groups = useMemo(() => {
    let index = 0;
    return CATEGORIES.flatMap(category => {
      const categoryItems = filteredItems.filter(item => item.category === category);
      if (categoryItems.length === 0) return [];
      return [{
        category,
        items: categoryItems.map(item => ({ item, index: index++ }))
      }];
    });
  }, [filteredItems]);

  useEffect(() => {
    setSelectedIndex(previous => {
      if (filteredItems.length === 0) return 0;
      return Math.min(previous, filteredItems.length - 1);
    });
  }, [filteredItems]);

  useEffect(() => {
    const active = listRef.current?.querySelector<HTMLElement>('[aria-selected="true"]');
    active?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  const choose = (item: CommandPaletteItem | undefined) => {
    if (!item) return;
    playCyberClick();
    item.onSelect();
    onClose();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (filteredItems.length === 0) return;
      playCyberBlip();
      setSelectedIndex(previous => (previous + 1) % filteredItems.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (filteredItems.length === 0) return;
      playCyberBlip();
      setSelectedIndex(previous => (previous - 1 + filteredItems.length) % filteredItems.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      choose(filteredItems[selectedIndex]);
    }
  };

  if (!isOpen) return null;

  const activeId = filteredItems[selectedIndex]?.id;

  return (
    <div className="hub-dialog-backdrop hub-dialog-backdrop--palette" onClick={onClose}>
      <div
        ref={panelRef}
        className="command-palette"
        role="dialog"
        aria-modal="true"
        aria-labelledby="command-palette-title"
        data-hub-dialog="open"
        onClick={event => event.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <h2 id="command-palette-title" className="sr-only">Командная палитра</h2>
        <div className="command-palette-search">
          <span aria-hidden="true">🔍</span>
          <input
            data-dialog-initial-focus
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-palette-list"
            aria-autocomplete="list"
            aria-activedescendant={activeId}
            value={query}
            onChange={event => {
              setQuery(event.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Разделы, комнаты, враги, действия"
          />
          {query ? (
            <button type="button" className="icon-btn" onClick={() => setQuery('')} aria-label="Очистить поиск">✕</button>
          ) : (
            <kbd>ESC</kbd>
          )}
        </div>

        <div ref={listRef} id="command-palette-list" className="command-palette-list" role="listbox" aria-label="Команды">
          {filteredItems.length === 0 ? (
            <div className="command-palette-empty">
              <p>Ничего не найдено по запросу «{query}»</p>
              <span>Попробуйте: карта, прыжок, босс, сборка, godot</span>
            </div>
          ) : groups.map(group => (
            <div key={group.category}>
              <div className="command-palette-group-title">
                <span aria-hidden="true">{COMMAND_CATEGORY_TITLES[group.category].icon}</span>
                <span>{COMMAND_CATEGORY_TITLES[group.category].title}</span>
                <span>({group.items.length})</span>
              </div>
              {group.items.map(({ item, index }) => {
                const selected = index === selectedIndex;
                return (
                  <button
                    key={item.id}
                    id={item.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={`command-palette-item${selected ? ' is-selected' : ''}`}
                    onClick={() => choose(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <span className="command-palette-item-main">
                      <span aria-hidden="true">{item.icon}</span>
                      <span className="command-palette-item-text">
                        <span className="command-palette-item-title">{item.title}</span>
                        {item.subtitle && <span className="command-palette-item-subtitle">{item.subtitle}</span>}
                      </span>
                    </span>
                    <span className="command-palette-item-meta">
                      {item.badge && <span className="command-palette-badge">{item.badge}</span>}
                      {item.shortcut && <kbd>{item.shortcut}</kbd>}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="command-palette-foot">
          <div className="command-palette-foot-keys">
            <span><kbd>↑</kbd> <kbd>↓</kbd> Навигация</span>
            <span><kbd>↵</kbd> Выбрать</span>
            <span><kbd>ESC</kbd> Закрыть</span>
          </div>
          <span>Cyber-Duck OS</span>
        </div>
      </div>
    </div>
  );
};
