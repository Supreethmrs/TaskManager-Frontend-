import React, { useState } from 'react';
import type { FormEvent } from 'react';
import './Login.css';
import { ThemePicker, type ThemeName } from './ThemePicker';
import { soundEffects } from './utils/SoundEffects';

interface SignupProps {
  onSwitchToLogin?: () => void;
  onLoginSuccess?: (email: string) => void;
  currentTheme?: ThemeName;
  onThemeChange?: (theme: ThemeName) => void;
}

export const Signup: React.FC<SignupProps> = ({
  onSwitchToLogin,
  onLoginSuccess,
  currentTheme = 'obsidian-aurora',
  onThemeChange = () => {},
}) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(false);
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password.trim()) {
      setError('Password is required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    soundEffects.playClick();

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const res = await fetch('http://localhost:3000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });
      const data = await res.json();

      if (res.ok) {
        setSubmitted(true);
        localStorage.setItem('token', data.token);
        soundEffects.playTaskComplete();
        if (onLoginSuccess) {
          onLoginSuccess(data.user?.email || normalizedEmail);
        }
      } else {
        setError(data.error || 'Signup failed');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('Could not reach the backend server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="center-auth-viewport">
      {/* Top Right Theme Picker */}
      <div className="center-auth-theme-picker">
        <ThemePicker currentTheme={currentTheme} onThemeChange={onThemeChange} compact />
      </div>

      {/* Main Centered Frosted Glass Signup Card */}
      <div className="center-login-card">
        <div className="card-brand-header">
          <div className="brand-badge-pill">
            <span className="brand-icon">⚡</span>
            <div className="brand-text-block">
              <span className="brand-name">TASKFORGE</span>
              <span className="brand-tag">HQ v2.0</span>
            </div>
          </div>
          <div className="status-live-chip">
            <span className="live-dot" />
            <span className="live-text">ONLINE</span>
          </div>
        </div>

        <div className="card-mode-toggle">
          <button
            type="button"
            className="toggle-tab"
            onClick={onSwitchToLogin}
          >
            LOG IN
          </button>
          <button
            type="button"
            className="toggle-tab active"
          >
            SIGN UP
          </button>
          <div className="toggle-glider right" />
        </div>

        <div className="card-title-block">
          <h1 className="card-main-title">CREATE ACCOUNT</h1>
          <p className="card-subtitle">
            Join the crew and level up your daily productivity with XP rewards
          </p>
        </div>

        {error && (
          <div className="center-alert error" role="alert">
            <span className="alert-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}
        {submitted && !error && (
          <div className="center-alert success" role="status">
            <span className="alert-icon">✨</span>
            <span>Account initialized! You can now log in.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="center-form-stack" noValidate>
          <div className="center-field-group">
            <label className="field-label" htmlFor="center-signup-email">
              COMM-LINK (EMAIL)
            </label>
            <div className="field-input-wrapper">
              <span className="field-icon">✉️</span>
              <input
                id="center-signup-email"
                type="email"
                className="center-input"
                placeholder="commander@taskforge.gg"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="center-field-group">
            <label className="field-label" htmlFor="center-signup-password">
              SECURITY KEY (PASSWORD)
            </label>
            <div className="field-input-wrapper">
              <span className="field-icon">🔒</span>
              <input
                id="center-signup-password"
                type={showPassword ? 'text' : 'password'}
                className="center-input"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="eye-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide Password' : 'Show Password'}
                aria-label={showPassword ? 'Hide Password' : 'Show Password'}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="center-field-group anim-slide-down">
            <label className="field-label" htmlFor="center-signup-confirm">
              CONFIRM PASSWORD
            </label>
            <div className="field-input-wrapper">
              <span className="field-icon">🛡️</span>
              <input
                id="center-signup-confirm"
                type={showConfirmPassword ? 'text' : 'password'}
                className="center-input"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError('');
                }}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="eye-toggle-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                title={showConfirmPassword ? 'Hide Password' : 'Show Password'}
                aria-label={showConfirmPassword ? 'Hide Password' : 'Show Password'}
              >
                {showConfirmPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="center-submit-btn" disabled={isLoading}>
            <span className="btn-shimmer-sweep" />
            <span className="btn-text">
              {isLoading ? 'INITIALIZING...' : 'CREATE ACCOUNT ➔'}
            </span>
          </button>
        </form>

        <div className="card-footer-switch">
          <span>Already have an account?</span>
          <button
            type="button"
            className="switch-action-btn"
            onClick={onSwitchToLogin}
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
