import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import type { LoginCredentials } from '../types/auth.types';

function GamepadIcon() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#f8f8ff" strokeWidth="1.9">
      <path d="M7 10h10a4 4 0 0 1 3.9 4.9l-.6 2.6a2.4 2.4 0 0 1-3.8 1.3L13.8 17h-3.6l-2.7 1.8a2.4 2.4 0 0 1-3.8-1.3L3.1 15A4 4 0 0 1 7 10Z" />
      <path d="M8 13v4" />
      <path d="M6 15h4" />
      <path d="M16 14h.01" />
      <path d="M18 16h.01" />
    </svg>
  );
}

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);

    try {
      await login(credentials);
      navigate('/home');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="page-shell auth-layout">
      <section className="auth-card">
        <div className="logo-lockup">
          <div className="logo-mark">
            <GamepadIcon />
          </div>
          <span className="logo-text">PlayHub</span>
        </div>

        <h1 className="page-title">Welcome back</h1>
        <p className="page-subtitle">Jump back into your favorite multiplayer minigames.</p>

        <div className="field-stack">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={credentials.email}
            onChange={(value) => setCredentials((current) => ({ ...current, email: value }))}
          />

          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={credentials.password}
            onChange={(value) => setCredentials((current) => ({ ...current, password: value }))}
            actionLabel={showPassword ? 'Hide' : 'Show'}
            onActionClick={() => setShowPassword((current) => !current)}
          />
        </div>

        <div className="auth-actions">
          <Button fullWidth isLoading={isLoading} onClick={handleSignIn}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>

          <div className="auth-links">
            <Button variant="ghost" onClick={() => navigate('/register')}>
              Don't have an account? Register
            </Button>
            <Button variant="ghost" onClick={() => undefined}>
              Forgot password?
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Login;
