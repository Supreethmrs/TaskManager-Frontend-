import React, { useState } from 'react';
import type { FormEvent } from 'react';
import './Login.css';
import { ThemePicker, type ThemeName } from './ThemePicker';

interface LoginProps {
  onSwitchToSignup?: () => void;
  onLoginSuccess?: (email: string) => void;
  currentTheme?: ThemeName;
  onThemeChange?: (theme: ThemeName) => void;
}

export const Login: React.FC<LoginProps> = ({
  onSwitchToSignup,
  onLoginSuccess,
  currentTheme = 'acid-glitch',
  onThemeChange = () => {},
}) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(false);

    // Basic Validation: Ensure both fields are provided
    if (!email.trim() && !password.trim()) {
      setError('Please enter your email and password');
      return;
    }

    if (!email.trim()) {
      setError('Email address is required');
      return;
    }

    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    // Reset error state
    setError('');

    // Call the real backend login endpoint
    try {
      const res = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        // Save the token so future requests know we're logged in
        localStorage.setItem('token', data.token);
        setSubmitted(true);
        if (onLoginSuccess) {
          onLoginSuccess(email);
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Could not reach the server. Is the backend running?');
    }
  };

  const handleInputChange = (field: 'email' | 'password', value: string) => {
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);
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
          <div className="gaming-badge" title="Gamer Access Portal">
            {/* Gamepad / Cyber Badge Icon */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="6" width="20" height="12" rx="4" />
              <path d="M6 12h4" />
              <path d="M8 10v4" />
              <circle cx="15" cy="11" r="1" fill="currentColor" />
              <circle cx="18" cy="13" r="1" fill="currentColor" />
            </svg>
          </div>
          <h1 className="login-title">Login</h1>
          <p className="login-subtitle">Enter the Game Realm</p>
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
            <span>Logged in successfully!</span>
          </div>
        )}

        {/* Login Form */}
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {/* Email Input Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="email-input">
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
                id="email-input"
                type="email"
                className={`gaming-input ${error && !email.trim() ? 'has-error' : ''}`}
                placeholder="Email"
                value={email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password Input Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="password-input">
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
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                className={`gaming-input ${error && !password.trim() ? 'has-error' : ''}`}
                placeholder="Password"
                value={password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                autoComplete="current-password"
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

          {/* Form Options (Remember & Forgot) */}
          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" className="gaming-checkbox" />
              <span>Remember me</span>
            </label>
            <a
              href="#forgot"
              className="forgot-link"
              onClick={(e) => {
                e.preventDefault();
                alert('Password reset module is currently locked.');
              }}
            >
              Forgot Password?
            </a>
          </div>

          {/* Submit Button */}
          <button type="submit" className="submit-btn">
            <span>Log In</span>
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
          <span>Don't have an account?</span>
          <button
            type="button"
            className="signup-link"
            onClick={onSwitchToSignup}
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
