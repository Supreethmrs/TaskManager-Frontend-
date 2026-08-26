import React, { useState } from 'react';
import type { FormEvent } from 'react';
import './Login.css';
import { ThemePicker, type ThemeName } from './ThemePicker';

interface SignupProps {
  onSwitchToLogin?: () => void;
  currentTheme?: ThemeName;
  onThemeChange?: (theme: ThemeName) => void;
}

export const Signup: React.FC<SignupProps> = ({
  onSwitchToLogin,
  currentTheme = 'acid-glitch',
  onThemeChange = () => {},
}) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(false);

    // Basic Validation
    if (!email.trim() && !password.trim() && !confirmPassword.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (!email.trim()) {
      setError('Email address is required');
      return;
    }

    // Basic email format check
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

    if (!confirmPassword.trim()) {
      setError('Please confirm your password');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Reset error state
    setError('');

    // Call the real backend signup endpoint
    try {
      const res = await fetch('http://localhost:3000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(data.error || 'Signup failed');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('Could not reach the server. Is the backend running?');
    }
  };

  const handleInputChange = (field: 'email' | 'password' | 'confirmPassword', value: string) => {
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);
    if (field === 'confirmPassword') setConfirmPassword(value);
    if (error) setError('');
    if (submitted) setSubmitted(false);
  };

  return (
    <div className="login-wrapper">
      {/* Corner Theme Picker on Auth Page */}
      <div className="auth-theme-picker-wrapper">
        <ThemePicker
          currentTheme={currentTheme}
          onThemeChange={onThemeChange}
          compact
        />
      </div>

      <div className="login-card">
        {/* Futuristic HUD Corner Decors */}
        <div className="hud-corner-tl" />
        <div className="hud-corner-br" />

        {/* Card Header */}
        <div className="login-header">
          <div className="gaming-badge" title="Create Player Account">
            {/* User Plus / Shield Badge Icon */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
          </div>
          <h1 className="login-title">Sign Up</h1>
          <p className="login-subtitle">Create Your Player Profile</p>
        </div>

        {/* Error Alert Banner */}
        {error && (
          <div className="error-banner" role="alert">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Success Confirmation Banner */}
        {submitted && !error && (
          <div className="success-banner" role="status">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>Account created successfully!</span>
          </div>
        )}

        {/* Signup Form */}
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {/* Email Input Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="signup-email">
              Email
            </label>
            <div className="input-container">
              <span className="input-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
              <input
                id="signup-email"
                type="email"
                className={`gaming-input ${error && (!email.trim() || error.includes('email')) ? 'has-error' : ''}`}
                placeholder="Email"
                value={email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password Input Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="signup-password">
              Password
            </label>
            <div className="input-container">
              <span className="input-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                className={`gaming-input ${error && (!password.trim() || error.includes('Password must')) ? 'has-error' : ''}`}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password Input Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="signup-confirm-password">
              Confirm Password
            </label>
            <div className="input-container">
              <span className="input-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </span>
              <input
                id="signup-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                className={`gaming-input ${error && (!confirmPassword.trim() || error.includes('match')) ? 'has-error' : ''}`}
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                title={showConfirmPassword ? 'Hide password' : 'Show password'}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" className="submit-btn">
            <span>Initialize Account</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </form>

        {/* Footer / Switch link */}
        <div className="login-footer">
          <span>Already have an account?</span>
          <button
            type="button"
            className="signup-link"
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
