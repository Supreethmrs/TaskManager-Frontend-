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
            onLoginSuccess={handleLoginSuccess}
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
  // THEME STATE & LOCALSTORAGE PERSISTENCE:
  // Stores user's chosen visual aesthetic across sessions.
  // =========================================================================
  const [theme, setTheme] = useState<ThemeName>(() => {
    const savedTheme = localStorage.getItem('taskforge_theme') as string | null;
    if (
      savedTheme === 'crystal-glacier' ||
      savedTheme === 'full-dark' ||
      savedTheme === 'midnight-emerald'
    ) {
      return savedTheme as ThemeName;
    }
    // Migration fallback for previous theme keys
    if (savedTheme === 'brat-charcoal' || savedTheme === 'dark-red') return 'midnight-emerald';
    return 'crystal-glacier'; // Default Flagship Crystal Clear Glacier Theme
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