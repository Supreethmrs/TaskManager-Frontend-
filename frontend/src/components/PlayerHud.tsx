import React, { useState, useEffect } from 'react';
import './PlayerHud.css';
import { soundEffects } from '../utils/SoundEffects';

export interface UserStats {
  id?: string;
  email?: string;
  xp: number;
  level: number;
  nextLevelXp: number;
  streakCount: number;
}

interface PlayerHudProps {
  stats: UserStats;
  onRefreshStats?: () => void;
}

export const PlayerHud: React.FC<PlayerHudProps> = ({ stats }) => {
  const [isMuted, setIsMuted] = useState<boolean>(soundEffects.getMuted());
  const [showLevelUpModal, setShowLevelUpModal] = useState<boolean>(false);
  const [lastLevel, setLastLevel] = useState<number>(stats.level);

  // Detect Level Up
  useEffect(() => {
    if (stats.level > lastLevel) {
      setShowLevelUpModal(true);
      soundEffects.playLevelUp();
      setLastLevel(stats.level);
    }
  }, [stats.level, lastLevel]);

  const handleToggleMute = () => {
    const muted = soundEffects.toggleMute();
    setIsMuted(muted);
  };

  // Calculate XP progress in current level tier
  const prevLevelXp = (stats.level - 1) * 500;
  const currentTierXp = Math.max(0, stats.xp - prevLevelXp);
  const tierTarget = 500;
  const progressPercent = Math.min(100, Math.max(0, (currentTierXp / tierTarget) * 100));

  return (
    <div className="player-hud-container">
      {/* Player Level Badge */}
      <div className="player-level-badge" title={`Player Level ${stats.level}`}>
        <span className="level-label">LVL</span>
        <span className="level-number">{stats.level}</span>
      </div>

      {/* XP Progress Bar */}
      <div className="player-xp-section">
        <div className="xp-info-row">
          <span className="xp-label">EXPERIENCE</span>
          <span className="xp-values">
            {stats.xp} <span className="xp-target">/ {stats.nextLevelXp} XP</span>
          </span>
        </div>
        <div className="xp-bar-track">
          <div
            className="xp-bar-fill"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="xp-bar-glimmer" />
          </div>
        </div>
      </div>

      {/* Daily Streak Flame */}
      <div
        className={`streak-pill ${stats.streakCount > 0 ? 'active' : ''}`}
        title={`${stats.streakCount} Day Completion Streak`}
      >
        <span className="streak-icon">🔥</span>
        <span className="streak-count">{stats.streakCount}d</span>
      </div>

      {/* SFX Audio Toggle */}
      <button
        type="button"
        className={`sfx-toggle-btn ${isMuted ? 'muted' : 'active'}`}
        onClick={handleToggleMute}
        title={isMuted ? 'Unmute Cyber SFX' : 'Mute Cyber SFX'}
      >
        {isMuted ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
            <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
        )}
      </button>

      {/* ---------------- LEVEL UP CELEBRATION MODAL ---------------- */}
      {showLevelUpModal && (
        <div className="levelup-overlay" onClick={() => setShowLevelUpModal(false)}>
          <div className="levelup-card" onClick={(e) => e.stopPropagation()}>
            <div className="levelup-sparkles">✨</div>
            <h2 className="levelup-title">LEVEL UP!</h2>
            <div className="levelup-badge-display">
              <span className="levelup-badge-txt">LEVEL {stats.level}</span>
            </div>
            <p className="levelup-desc">
              Outstanding work, commander! You have advanced to Level {stats.level}. Keep completing missions to unlock higher ranks.
            </p>
            <button
              type="button"
              className="btn-primary levelup-ack-btn"
              onClick={() => setShowLevelUpModal(false)}
            >
              Claim Victory
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
