import React, { useState, useEffect } from 'react';
import './AchievementsModal.css';

export interface Achievement {
  id: string;
  title: string;
  emoji: string;
  desc: string;
  unlocked: boolean;
  progress: number;
}

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  token?: string | null;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  token,
}) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<{ totalCompleted: number; streak: number; xp: number; level: number }>({
    totalCompleted: 0,
    streak: 0,
    xp: 0,
    level: 1,
  });

  useEffect(() => {
    if (isOpen && token) {
      fetch('http://localhost:3000/api/achievements', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.achievements) {
            setAchievements(data.achievements);
            setStats({
              totalCompleted: data.totalCompleted || 0,
              streak: data.streak || 0,
              xp: data.xp || 0,
              level: data.level || 1,
            });
          }
        })
        .catch((err) => console.error('Failed to fetch achievements', err));
    }
  }, [isOpen, token]);

  if (!isOpen) return null;

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="achievements-overlay" onClick={onClose}>
      <div className="achievements-card" onClick={(e) => e.stopPropagation()}>
        <div className="achievements-header">
          <div className="achievements-title-wrap">
            <span className="trophy-icon">🏆</span>
            <div>
              <h2 className="achievements-title">TROPHY VAULT</h2>
              <span className="achievements-subtitle">
                UNLOCKED {unlockedCount} / {achievements.length} BADGES
              </span>
            </div>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Commander Stats Pill Bar */}
        <div className="commander-stats-bar">
          <div className="stat-pill">
            <span className="pill-val">LVL {stats.level}</span>
            <span className="pill-lbl">RANK</span>
          </div>
          <div className="stat-pill">
            <span className="pill-val">{stats.xp} XP</span>
            <span className="pill-lbl">TOTAL EXPERIENCE</span>
          </div>
          <div className="stat-pill">
            <span className="pill-val">{stats.totalCompleted}</span>
            <span className="pill-lbl">CLEARED MISSIONS</span>
          </div>
          <div className="stat-pill">
            <span className="pill-val">🔥 {stats.streak}d</span>
            <span className="pill-lbl">STREAK</span>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="badges-grid">
          {achievements.map((item) => (
            <div
              key={item.id}
              className={`badge-card ${item.unlocked ? 'unlocked' : 'locked'}`}
            >
              <div className="badge-emoji-disc">
                <span className="badge-emoji">{item.emoji}</span>
              </div>
              <div className="badge-details">
                <div className="badge-title-row">
                  <span className="badge-title">{item.title}</span>
                  <span className="badge-status-tag">
                    {item.unlocked ? 'UNLOCKED' : 'LOCKED'}
                  </span>
                </div>
                <p className="badge-desc">{item.desc}</p>
                <div className="badge-progress-track">
                  <div
                    className="badge-progress-fill"
                    style={{ width: `${item.progress * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
