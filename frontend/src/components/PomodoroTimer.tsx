import React, { useState, useEffect, useRef } from 'react';
import './PomodoroTimer.css';
import { soundEffects } from '../utils/SoundEffects';
import { ambientAudio, AMBIENT_TRACKS, type AmbientTrackId } from '../utils/AmbientAudio';

interface PomodoroTimerProps {
  activeTaskTitle?: string;
  onClose?: () => void;
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  activeTaskTitle,
  onClose,
}) => {
  const [mode, setMode] = useState<'focus' | 'break' | 'custom'>('focus');
  const [duration, setDuration] = useState<number>(25 * 60); // 25 min default
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);
  const [customInputMins, setCustomInputMins] = useState<string>('30');
  const [currentAmbient, setCurrentAmbient] = useState<AmbientTrackId>('none');
  const [ambientVolume, setAmbientVolume] = useState<number>(50);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      soundEffects.playTimerComplete();
      ambientAudio.stop();
      setCurrentAmbient('none');
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft]);

  // Clean up ambient audio on unmount
  useEffect(() => {
    return () => {
      ambientAudio.stop();
    };
  }, []);

  const handleStartPause = () => {
    soundEffects.playClick();
    const nextRunning = !isRunning;
    setIsRunning(nextRunning);
    if (!nextRunning && currentAmbient !== 'none') {
      // Pause ambient when timer is paused
      ambientAudio.stop();
      setCurrentAmbient('none');
    }
  };

  const handleReset = () => {
    soundEffects.playClick();
    setIsRunning(false);
    setTimeLeft(duration);
    ambientAudio.stop();
    setCurrentAmbient('none');
  };

  const handleSetMode = (newMode: 'focus' | 'break' | 'custom', mins: number) => {
    soundEffects.playClick();
    setMode(newMode);
    setShowCustomInput(false);
    setIsRunning(false);
    const secs = mins * 60;
    setDuration(secs);
    setTimeLeft(secs);
  };

  const handleAdjustMinutes = (deltaMins: number) => {
    soundEffects.playClick();
    const currentMins = Math.floor(timeLeft / 60);
    const newMins = Math.max(1, Math.min(180, currentMins + deltaMins));
    const newSecs = newMins * 60;
    setDuration(newSecs);
    setTimeLeft(newSecs);
    setMode('custom');
  };

  const handleApplyCustom = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const mins = parseInt(customInputMins, 10);
    if (!isNaN(mins) && mins > 0 && mins <= 240) {
      handleSetMode('custom', mins);
    }
  };

  const handleSelectAmbient = (trackId: AmbientTrackId) => {
    soundEffects.playClick();
    if (currentAmbient === trackId) {
      ambientAudio.stop();
      setCurrentAmbient('none');
    } else {
      ambientAudio.playTrack(trackId);
      setCurrentAmbient(trackId);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setAmbientVolume(val);
    ambientAudio.setVolume(val / 100);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // SVG circular progress calculation
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (timeLeft / duration) * circumference;

  return (
    <div className="pomodoro-timer-card">
      <div className="pomodoro-header">
        <div className="pomodoro-title-wrap">
          <span className="pomodoro-icon">⏱️</span>
          <span className="pomodoro-title">CYBER FOCUS TIMER</span>
        </div>
        {onClose && (
          <button
            type="button"
            className="pomodoro-close-btn"
            onClick={() => {
              ambientAudio.stop();
              onClose();
            }}
            title="Close timer"
          >
            ✕
          </button>
        )}
      </div>

      {activeTaskTitle && (
        <div className="pomodoro-active-task" title={activeTaskTitle}>
          <span className="task-target-label">LOCKED TARGET:</span>
          <span className="task-target-name">{activeTaskTitle}</span>
        </div>
      )}

      {/* Circular Progress & Time Display with Quick Adjust Buttons */}
      <div className="pomodoro-dial-wrapper">
        <button
          type="button"
          className="time-adjust-btn"
          onClick={() => handleAdjustMinutes(-5)}
          title="Minus 5 minutes"
          disabled={isRunning}
        >
          -5m
        </button>

        <div className="pomodoro-dial-container">
          <svg className="pomodoro-dial-svg" viewBox="0 0 100 100">
            <circle
              className="dial-track"
              cx="50"
              cy="50"
              r={radius}
            />
            <circle
              className="dial-progress"
              cx="50"
              cy="50"
              r={radius}
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: strokeDashoffset,
              }}
            />
          </svg>

          <div className="pomodoro-time-display">
            <span className="time-digits">{timeFormatted}</span>
            <span className="time-mode-label">
              {mode === 'focus' ? 'FOCUS SESSION' : mode === 'break' ? 'COOL DOWN' : 'CUSTOM SESSION'}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="time-adjust-btn"
          onClick={() => handleAdjustMinutes(5)}
          title="Plus 5 minutes"
          disabled={isRunning}
        >
          +5m
        </button>
      </div>

      {/* Preset & Custom Timing Selectors */}
      <div className="pomodoro-presets">
        <button
          type="button"
          className={`preset-btn ${mode === 'focus' && duration === 15 * 60 ? 'active' : ''}`}
          onClick={() => handleSetMode('focus', 15)}
        >
          15m
        </button>
        <button
          type="button"
          className={`preset-btn ${mode === 'focus' && duration === 25 * 60 ? 'active' : ''}`}
          onClick={() => handleSetMode('focus', 25)}
        >
          25m Focus
        </button>
        <button
          type="button"
          className={`preset-btn ${mode === 'focus' && duration === 45 * 60 ? 'active' : ''}`}
          onClick={() => handleSetMode('focus', 45)}
        >
          45m Deep Work
        </button>
        <button
          type="button"
          className={`preset-btn ${mode === 'focus' && duration === 60 * 60 ? 'active' : ''}`}
          onClick={() => handleSetMode('focus', 60)}
        >
          60m
        </button>
        <button
          type="button"
          className={`preset-btn ${mode === 'break' ? 'active' : ''}`}
          onClick={() => handleSetMode('break', 5)}
        >
          5m Break
        </button>
        <button
          type="button"
          className={`preset-btn custom ${showCustomInput ? 'active' : ''}`}
          onClick={() => {
            soundEffects.playClick();
            setShowCustomInput(!showCustomInput);
          }}
        >
          ⚙️ Custom
        </button>
      </div>

      {/* Custom Duration Input Box */}
      {showCustomInput && (
        <form onSubmit={handleApplyCustom} className="custom-time-input-row">
          <span className="custom-input-label">CUSTOM MINS:</span>
          <input
            type="number"
            min="1"
            max="240"
            className="custom-number-input"
            value={customInputMins}
            onChange={(e) => setCustomInputMins(e.target.value)}
            autoFocus
          />
          <button type="submit" className="custom-apply-btn">
            Apply
          </button>
        </form>
      )}

      {/* Ambient Lofi & Cyber Soundscapes Section */}
      <div className="ambient-audio-section">
        <div className="ambient-header-row">
          <span className="ambient-title">🎧 AMBIENT FOCUS AUDIO:</span>
          {currentAmbient !== 'none' && (
            <div className="ambient-vol-control">
              <span className="vol-icon">🔈</span>
              <input
                type="range"
                min="0"
                max="100"
                value={ambientVolume}
                onChange={handleVolumeChange}
                className="ambient-vol-slider"
                title={`Volume: ${ambientVolume}%`}
              />
            </div>
          )}
        </div>
        <div className="ambient-tracks-chips">
          {AMBIENT_TRACKS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`ambient-chip ${currentAmbient === t.id ? 'active' : ''}`}
              onClick={() => handleSelectAmbient(t.id)}
              title={t.desc}
            >
              <span>{t.emoji}</span> {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Action Controls */}
      <div className="pomodoro-controls">
        <button
          type="button"
          className={`pomodoro-main-btn ${isRunning ? 'running' : ''}`}
          onClick={handleStartPause}
        >
          {isRunning ? 'Pause' : 'Start Focus'}
        </button>
        <button
          type="button"
          className="pomodoro-reset-btn"
          onClick={handleReset}
          title="Reset timer"
        >
          Reset
        </button>
      </div>
    </div>
  );
};
