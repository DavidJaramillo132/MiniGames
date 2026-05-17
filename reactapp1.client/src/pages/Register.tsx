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
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(83,74,183,0.12),transparent_30%),#0f0f13] px-4 py-8 font-sans text-[#f5f7ff]">
      <section className="w-full max-w-[400px] rounded-[12px] border border-[#2a2a3a] bg-gradient-to-b from-[rgba(32,32,45,0.96)] to-[rgba(24,24,35,0.96)] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.35)] max-sm:px-5 max-sm:py-7">
        <div className="mb-7 inline-flex items-center gap-[14px]">
          <div className="inline-flex h-[52px] w-[52px] items-center justify-center rounded-[14px] bg-gradient-to-br from-[rgba(83,74,183,0.95)] to-[rgba(120,111,230,0.95)] shadow-[0_12px_30px_rgba(83,74,183,0.35)]">
            <GamepadIcon />
          </div>
          <span className="text-[2rem] font-bold tracking-[-0.03em]">PlayHub</span>
        </div>

        <h1 className="mb-2 text-[1.85rem] leading-[1.1] font-bold tracking-[-0.03em]">
          Create your account
        </h1>
        <p className="mb-7 text-[#f5f7ff]/68">
          Set up your profile and start competing with friends.
        </p>

        <div className="grid gap-4">
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

          <div className="grid gap-2">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password"
              value={fields.password}
              onChange={(value) => setFields((current) => ({ ...current, password: value }))}
              actionLabel={showPassword ? 'Hide' : 'Show'}
              onActionClick={() => setShowPassword((current) => !current)}
            />
            <div className="grid gap-2">
              <div className="grid grid-cols-4 gap-2">
                {strengthLevels.map((level, index) => (
                  <span
                    key={level.label}
                    className={`h-2 rounded-full bg-white/8 ${
                      index < strength
                        ? level.className === 'weak'
                          ? 'bg-[#d16a6a]'
                          : level.className === 'fair'
                            ? 'bg-[#e5a55d]'
                            : level.className === 'good'
                              ? 'bg-[#8ac86f]'
                              : 'bg-[#5dcaa5]'
                        : ''
                    }`}
                  />
                ))}
              </div>
              <span className="text-[0.86rem] text-[#f5f7ff]/68">
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

        <div className="mt-6 grid gap-[18px]">
          <Button fullWidth isLoading={isLoading} onClick={handleCreateAccount}>
            {isLoading ? 'Creating account...' : 'Create account'}
          </Button>

          <div className="grid gap-3">
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
