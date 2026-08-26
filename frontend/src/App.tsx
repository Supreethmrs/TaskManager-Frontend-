import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import Dashboard from './Dashboard';
import type { ThemeName } from './ThemePicker';

interface AppRoutesProps {
  currentTheme: ThemeName;
  onThemeChange: (theme: ThemeName) => void;
}

function AppRoutes({ currentTheme, onThemeChange }: AppRoutesProps) {
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
  const navigate = useNavigate();

  const handleLoginSuccess = (email: string) => {
    setCurrentUserEmail(email);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <Login
            onSwitchToSignup={() => navigate('/signup')}
            onLoginSuccess={handleLoginSuccess}
            currentTheme={currentTheme}
            onThemeChange={onThemeChange}
          />
        }
      />
      <Route
        path="/signup"
        element={
          <Signup
            onSwitchToLogin={() => navigate('/login')}
            currentTheme={currentTheme}
            onThemeChange={onThemeChange}
          />
        }
      />
      <Route
        path="/dashboard"
        element={
          isLoggedIn ? (
            <Dashboard
              userEmail={currentUserEmail}
              onLogout={handleLogout}
              currentTheme={currentTheme}
              onThemeChange={onThemeChange}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="*"
        element={<Navigate to={isLoggedIn ? '/dashboard' : '/login'} replace />}
      />
    </Routes>
  );
}

function App() {
  // =========================================================================
  // GEN-Z THEME STATE & LOCALSTORAGE PERSISTENCE:
  // Stores user's chosen Gen-Z visual aesthetic across sessions.
  // =========================================================================
  const [theme, setTheme] = useState<ThemeName>(() => {
    const savedTheme = localStorage.getItem('taskforge_theme') as ThemeName | null;
    if (
      savedTheme === 'acid-glitch' ||
      savedTheme === 'neon-tokyo' ||
      savedTheme === 'brat-charcoal' ||
      savedTheme === 'dreamcore-y2k'
    ) {
      return savedTheme;
    }
    // Migration fallback for previous theme keys
    if (savedTheme === 'dark-red') return 'acid-glitch';
    if (savedTheme === 'light' || savedTheme === 'lavender-lime') return 'dreamcore-y2k';
    return 'acid-glitch'; // Default Gen-Z Acid Cyberpunk theme
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('taskforge_theme', theme);
  }, [theme]);

  const handleThemeChange = (newTheme: ThemeName) => {
    setTheme(newTheme);
  };

  return (
    <BrowserRouter>
      <main style={{ width: '100%', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
        <AppRoutes currentTheme={theme} onThemeChange={handleThemeChange} />
      </main>
    </BrowserRouter>
  );
}

export default App;