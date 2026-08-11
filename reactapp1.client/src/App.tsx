import { BrowserRouter } from 'react-router-dom';
import { useEffect } from 'react';
import AppRoutes from './routes/AppRoutes';
import { useAuth } from './hooks/useAuth';
import { getTokenExpiration } from './utils/tokenHelper';
import ErrorBoundary from './components/ui/ErrorBoundary';
import LanguageToggle from './components/ui/LanguageToggle';
import RouteMetadata from './components/seo/RouteMetadata';

function App() {
  const { initializeSession, logout, token } = useAuth();

  useEffect(() => {
    void initializeSession();
  }, [initializeSession]);

  useEffect(() => {
    if (!token) { return; }

    const expiresAt = getTokenExpiration(token);

    if (!expiresAt) {
      void logout();
      return;
    }

    const timeout = window.setTimeout(() => {
      void logout();
    }, Math.max(0, expiresAt - Date.now()));

    return () => window.clearTimeout(timeout);
  }, [token, logout]);

  return (
    <BrowserRouter>
      <RouteMetadata />
      <LanguageToggle />
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
