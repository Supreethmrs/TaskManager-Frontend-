import React, { useState, useRef, useEffect } from 'react';
import './ThemePicker.css';

export type ThemeName =
  | 'crystal-glacier'
  | 'full-dark'
  | 'midnight-emerald'
  | 'obsidian-aurora'
  | 'cyber-slate'
  | 'polar-frost'
  | 'acid-glitch'
  | 'neon-tokyo'
  | 'brat-charcoal'
  | 'dreamcore-y2k';

export interface ThemeOption {
  id: ThemeName;
  name: string;
  emoji: string;
  description: string;
  bgPreview: string;
  accentPreview: string;
  accentSecondaryPreview: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'crystal-glacier',
    name: 'Crystal Clear Glacier',
    emoji: '🧊',
    description: 'Arctic Abyss & Glacial Ice Cyan',
    bgPreview: '#02111e',
    accentPreview: '#00d2ff',
    accentSecondaryPreview: '#7dd3fc',
  },
  {
    id: 'full-dark',
    name: 'Full Dark Mode',
    emoji: '🌑',
    description: 'Pitch Black & Crisp Contrast',
    bgPreview: '#000000',
    accentPreview: '#6366f1',
    accentSecondaryPreview: '#38bdf8',
  },
  {
    id: 'midnight-emerald',
    name: 'Midnight Emerald',
    emoji: '🌿',
    description: 'Deep Slate & Cyber Mint',
    bgPreview: '#080d12',
    accentPreview: '#10b981',
    accentSecondaryPreview: '#14b8a6',
  },
];

interface ThemePickerProps {
  currentTheme: ThemeName;
  onThemeChange: (theme: ThemeName) => void;
  compact?: boolean;
}

export const ThemePicker: React.FC<ThemePickerProps> = ({
  currentTheme,
  onThemeChange,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (themeId: ThemeName) => {
    onThemeChange(themeId);
    setIsOpen(false);
  };

  return (
    <div
      className={`theme-picker-container ${compact ? 'compact' : ''}`}
      ref={containerRef}
    >
      {/* Theme Trigger Button */}
      <button
        type="button"
        className={`theme-picker-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Theme Palette"
        aria-label="Theme Palette"
        aria-expanded={isOpen}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
          <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
          <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
          <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
        </svg>
      </button>

      {/* Theme Selection Swatch Dropdown Panel */}
      {isOpen && (
        <div className="theme-picker-dropdown" role="menu">
          <div className="theme-picker-header">
            <span className="theme-header-txt">✨ THEME PALETTES</span>
          </div>

          <div className="theme-options-list">
            {THEME_OPTIONS.map((theme) => {
              const isSelected = currentTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  className={`theme-option-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelect(theme.id)}
                  role="menuitem"
                >
                  {/* Swatch Preview Disc */}
                  <div
                    className="theme-swatch-disc"
                    style={{
                      backgroundColor: theme.bgPreview,
                      border: theme.id === 'polar-frost' || theme.id === 'dreamcore-y2k' ? '1px solid #cbd5e1' : '1px solid #2d3748',
                    }}
                  >
                    <span
                      className="swatch-accent"
                      style={{ backgroundColor: theme.accentPreview }}
                    />
                    <span
                      className="swatch-accent-secondary"
                      style={{ backgroundColor: theme.accentSecondaryPreview }}
                    />
                  </div>

                  {/* Theme Info */}
                  <div className="theme-option-text">
                    <span className="theme-name">
                      <span className="theme-emoji">{theme.emoji}</span> {theme.name}
                    </span>
                    <span className="theme-desc">{theme.description}</span>
                  </div>

                  {/* Selected Indicator Checkmark */}
                  {isSelected && (
                    <span className="theme-check-icon" aria-hidden="true">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemePicker;
