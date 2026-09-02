import React, { useState } from 'react';
import type { FormEvent } from 'react';
import './Login.css';
import { ThemePicker, type ThemeName } from './ThemePicker';
import { soundEffects } from './utils/SoundEffects';

interface LoginProps {
  onSwitchToSignup?: () => void;
  onLoginSuccess?: (email: string) => void;
  currentTheme?: ThemeName;
  onThemeChange?: (theme: ThemeName) => void;
}

export const Login: React.FC<LoginProps> = ({
  onSwitchToSignup: _onSwitchToSignup,
  onLoginSuccess,
  currentTheme = 'crystal-glacier',
  onThemeChange = () => {},
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [signupSuccess, setSignupSuccess] = useState<boolean>(false);

  const fillDemo = () => {
    soundEffects.playClick();
    setEmail('commander@taskforge.gg');
    setPassword('password123');
    setError('');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSignupSuccess(false);

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    if (mode === 'signup') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }

    setIsLoading(true);
    soundEffects.playClick();

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const endpoint = mode === 'login' ? 'http://localhost:3000/api/login' : 'http://localhost:3000/api/signup';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        soundEffects.playTaskComplete();
        if (onLoginSuccess) {
          onLoginSuccess(data.user?.email || normalizedEmail);
        }
      } else {
        setError(data.error || (mode === 'login' ? 'Invalid email or password' : 'Signup failed'));
      }
    } catch (err) {
      console.error(err);
      setError('Could not reach the backend server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="center-auth-viewport">
      {/* Top Floating Controls */}
      <div className="center-auth-theme-picker">
        <ThemePicker currentTheme={currentTheme} onThemeChange={onThemeChange} compact />
      </div>

      {/* Main Luxury Crystal Glass Login Portal */}
      <div className="luxury-auth-card">
        {/* Animated Crystalline Aura Halo */}
        <div className="card-ambient-glow" />
        <div className="card-top-shine" />

        {/* Hero Brand Header */}
        <div className="auth-hero-section">
          <div className="hero-emblem-wrap">
            <div className="hero-emblem-ring" />
            <div className="hero-emblem-inner">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="emblem-svg">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
          </div>
          
          <div className="hero-brand-meta">
            <div className="brand-title-row">
              <h2 className="brand-logo-text">TaskForge</h2>
              <span className="brand-version-badge">Glacier v2.5</span>
            </div>
            <p className="hero-tagline">
              {mode === 'login' 
                ? 'High-Performance Workspace Matrix' 
                : 'Level up your productivity & quests'}
            </p>
          </div>
        </div>

        {/* Floating Pill Segmented Switcher */}
        <div className="auth-segmented-nav">
          <button
            type="button"
            className={`nav-segment ${mode === 'login' ? 'active' : ''}`}
            onClick={() => {
              soundEffects.playClick();
              setMode('login');
              setError('');
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`nav-segment ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => {
              soundEffects.playClick();
              setMode('signup');
              setError('');
            }}
          >
            Create Account
          </button>
          <div className={`nav-slider-glow ${mode === 'signup' ? 'slide-right' : 'slide-left'}`} />
        </div>

        {/* Alerts */}
        {error && (
          <div className="luxury-alert alert-error" role="alert">
            <span className="alert-badge">!</span>
            <span className="alert-text">{error}</span>
          </div>
        )}
        {signupSuccess && (
          <div className="luxury-alert alert-success" role="status">
            <span className="alert-badge">✓</span>
            <span className="alert-text">Account created! Redirecting to Sign In...</span>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="auth-interactive-form" noValidate>
          {/* Email Input */}
          <div className="input-crystal-field">
            <div className="field-header-meta">
              <label htmlFor="auth-email" className="crystal-label">
                Work Email
              </label>
              {mode === 'login' && (
                <button type="button" className="quick-demo-link" onClick={fillDemo}>
                  ⚡ Fast Demo
                </button>
              )}
            </div>
            <div className="crystal-input-shell">
              <span className="shell-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </span>
              <input
                id="auth-email"
                type="email"
                className="crystal-native-input"
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

          {/* Password Input */}
          <div className="input-crystal-field">
            <div className="field-header-meta">
              <label htmlFor="auth-password" className="crystal-label">
                Security Password
              </label>
            </div>
            <div className="crystal-input-shell">
              <span className="shell-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                className="crystal-native-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                className="eye-crystal-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password (Sign Up) */}
          {mode === 'signup' && (
            <div className="input-crystal-field anim-slide-in">
              <div className="field-header-meta">
                <label htmlFor="auth-confirm-pass" className="crystal-label">
                  Confirm Password
                </label>
              </div>
              <div className="crystal-input-shell">
                <span className="shell-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </span>
                <input
                  id="auth-confirm-pass"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="crystal-native-input"
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
                  className="eye-crystal-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Submit Magnetic Glass Button */}
          <button type="submit" className="luxury-submit-btn" disabled={isLoading}>
            <span className="btn-ambient-glow" />
            <span className="btn-laser-shimmer" />
            <span className="btn-content-flex">
              {isLoading ? (
                <>
                  <span className="btn-spinner" />
                  <span>Connecting...</span>
                </>
              ) : mode === 'login' ? (
                <>
                  <span>Enter Workspace</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="btn-arrow-svg">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              ) : (
                <>
                  <span>Initialize Account</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="btn-arrow-svg">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </span>
          </button>
        </form>

        {/* Footer Switch */}
        <div className="luxury-card-footer">
          <span className="footer-prompt">
            {mode === 'login' ? "Don't have an account?" : 'Already a registered member?'}
          </span>
          <button
            type="button"
            className="footer-link-btn"
            onClick={() => {
              soundEffects.playClick();
              setMode(mode === 'login' ? 'signup' : 'login');
              setError('');
            }}
          >
            {mode === 'login' ? 'Create one now' : 'Sign in here'}
          </button>
        </div>

        {/* Luxury Micro Badges */}
        <div className="luxury-badge-row">
          <div className="micro-badge">
            <span className="badge-bullet" />
            <span>End-to-End Encrypted</span>
          </div>
          <div className="micro-badge">
            <span className="badge-bullet" />
            <span>Real-Time Sync</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
