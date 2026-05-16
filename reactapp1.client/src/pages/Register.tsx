import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import type { RegistrationFields } from '../types/auth.types';

const strengthLevels = [
  { label: 'Weak', className: 'weak' },
  { label: 'Fair', className: 'fair' },
  { label: 'Good', className: 'good' },
  { label: 'Strong', className: 'strong' },
];

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

function calculateStrength(password: string) {
  let score = 0;

  if (password.length >= 8) {
    score += 1;
  }

  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) {
    score += 1;
  }

  if (/\d/.test(password)) {
    score += 1;
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  }

  return Math.min(score, 4);
}

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [fields, setFields] = useState<RegistrationFields>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const strength = calculateStrength(fields.password);
  const strengthCopy = strengthLevels[Math.max(strength - 1, 0)];

  const handleCreateAccount = async () => {
    setIsLoading(true);

    try {
      await register(fields);
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

        <h1 className="page-title">Create your account</h1>
        <p className="page-subtitle">Set up your profile and start competing with friends.</p>

        <div className="field-stack">
          <Input
            label="Username"
            type="text"
            placeholder="Choose a username"
            value={fields.username}
            onChange={(value) => setFields((current) => ({ ...current, username: value }))}
          />

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={fields.email}
            onChange={(value) => setFields((current) => ({ ...current, email: value }))}
          />

          <div className="field-group">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password"
              value={fields.password}
              onChange={(value) => setFields((current) => ({ ...current, password: value }))}
              actionLabel={showPassword ? 'Hide' : 'Show'}
              onActionClick={() => setShowPassword((current) => !current)}
            />
            <div className="strength-meter">
              <div className="strength-track">
                {strengthLevels.map((level, index) => (
                  <span
                    key={level.label}
                    className={`strength-segment${index < strength ? ` active ${level.className}` : ''}`}
                  />
                ))}
              </div>
              <span className="input-help">
                Password strength: {fields.password ? strengthCopy.label : 'Start typing to measure'}
              </span>
            </div>
          </div>

          <Input
            label="Confirm password"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Repeat your password"
            value={fields.confirmPassword}
            onChange={(value) =>
              setFields((current) => ({ ...current, confirmPassword: value }))
            }
            actionLabel={showConfirmPassword ? 'Hide' : 'Show'}
            onActionClick={() => setShowConfirmPassword((current) => !current)}
          />
        </div>

        <div className="auth-actions">
          <Button fullWidth isLoading={isLoading} onClick={handleCreateAccount}>
            {isLoading ? 'Creating account...' : 'Create account'}
          </Button>

          <div className="auth-links">
            <Button variant="ghost" onClick={() => navigate('/login')}>
              Already have an account? Sign in
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Register;
