import React, { useState, useEffect, useRef } from 'react';
import './CommandPalette.css';
import { type ThemeName, THEME_OPTIONS } from '../ThemePicker';

export interface CommandItem {
  id: string;
  title: string;
  category: 'NAVIGATION' | 'ACTION' | 'THEME' | 'FILTER';
  shortcut?: string;
  icon: string;
  run: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddModal: () => void;
  onToggleFocus: () => void;
  onSwitchView: (view: 'list' | 'cards' | 'table' | 'kanban' | 'analytics') => void;
  onSwitchTheme: (theme: ThemeName) => void;
  onSetCategoryFilter: (cat: string) => void;
  onOpenAchievements: () => void;
  onExportData: (format: 'json' | 'csv' | 'markdown') => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpenAddModal,
  onToggleFocus,
  onSwitchView,
  onSwitchTheme,
  onSetCategoryFilter,
  onOpenAchievements,
  onExportData,
}) => {
  const [query, setQuery] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = [
    {
      id: 'add_task',
      title: 'Create New Quest',
      category: 'ACTION',
      shortcut: 'N',
      icon: '➕',
      run: () => onOpenAddModal(),
    },
    {
      id: 'toggle_focus',
      title: 'Toggle Cyber Focus Clock',
      category: 'ACTION',
      shortcut: 'F',
      icon: '⏱️',
      run: () => onToggleFocus(),
    },
    {
      id: 'open_achievements',
      title: 'View Achievements & Badges',
      category: 'ACTION',
      shortcut: 'A',
      icon: '🏆',
      run: () => onOpenAchievements(),
    },
    {
      id: 'view_kanban',
      title: 'Switch to Kanban Board View',
      category: 'NAVIGATION',
      shortcut: 'K',
      icon: '📋',
      run: () => onSwitchView('kanban'),
    },
    {
      id: 'view_list',
      title: 'Switch to List View',
      category: 'NAVIGATION',
      shortcut: '1',
      icon: '📑',
      run: () => onSwitchView('list'),
    },
    {
      id: 'view_cards',
      title: 'Switch to Cards View',
      category: 'NAVIGATION',
      shortcut: '2',
      icon: '🗂️',
      run: () => onSwitchView('cards'),
    },
    {
      id: 'view_table',
      title: 'Switch to Table View',
      category: 'NAVIGATION',
      shortcut: '3',
      icon: '📊',
      run: () => onSwitchView('table'),
    },
    {
      id: 'view_analytics',
      title: 'Switch to Command Center Analytics',
      category: 'NAVIGATION',
      shortcut: '4',
      icon: '📈',
      run: () => onSwitchView('analytics'),
    },
    ...THEME_OPTIONS.map((theme) => ({
      id: `theme_${theme.id}`,
      title: `Theme: ${theme.name} (${theme.description})`,
      category: 'THEME' as const,
      icon: theme.emoji,
      run: () => onSwitchTheme(theme.id),
    })),
    {
      id: 'filter_work',
      title: 'Filter: Work Missions',
      category: 'FILTER',
      icon: '💼',
      run: () => onSetCategoryFilter('Work'),
    },
    {
      id: 'filter_personal',
      title: 'Filter: Personal Missions',
      category: 'FILTER',
      icon: '🎯',
      run: () => onSetCategoryFilter('Personal'),
    },
    {
      id: 'filter_urgent',
      title: 'Filter: Urgent Missions',
      category: 'FILTER',
      icon: '🔥',
      run: () => onSetCategoryFilter('Urgent'),
    },
    {
      id: 'export_csv',
      title: 'Export Quests to CSV Spreadsheet',
      category: 'ACTION',
      icon: '📊',
      run: () => onExportData('csv'),
    },
    {
      id: 'export_md',
      title: 'Export Weekly Report to Markdown',
      category: 'ACTION',
      icon: '📝',
      run: () => onExportData('markdown'),
    },
  ];

  const filtered = commands.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].run();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="cmd-palette-overlay" onClick={onClose}>
      <div className="cmd-palette-card" onClick={(e) => e.stopPropagation()}>
        <div className="cmd-input-wrap">
          <span className="cmd-search-icon">⚡</span>
          <input
            ref={inputRef}
            type="text"
            className="cmd-palette-input"
            placeholder="Type a command, search or switch theme..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <kbd className="cmd-esc-tag">ESC</kbd>
        </div>

        <div className="cmd-results-list">
          {filtered.length === 0 ? (
            <div className="cmd-empty-msg">No matching commands found.</div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  className={`cmd-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    item.run();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <span className="cmd-item-icon">{item.icon}</span>
                  <div className="cmd-item-info">
                    <span className="cmd-item-title">{item.title}</span>
                    <span className="cmd-item-cat">{item.category}</span>
                  </div>
                  {item.shortcut && <kbd className="cmd-item-shortcut">{item.shortcut}</kbd>}
                </div>
              );
            })
          )}
        </div>

        <div className="cmd-footer-bar">
          <span>Navigation: <kbd>↑</kbd> <kbd>↓</kbd></span>
          <span>Select: <kbd>↵ Enter</kbd></span>
          <span>Close: <kbd>ESC</kbd></span>
        </div>
      </div>
    </div>
  );
};
