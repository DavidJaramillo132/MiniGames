import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import type { RegistrationFields } from '../types/auth.types';

const strengthLevels = [
  { label: 'Weak', className: 'bg-[#ff7b63]' },
  { label: 'Fair', className: 'bg-[#ffc76a]' },
  { label: 'Good', className: 'bg-[#78e6ff]' },
  { label: 'Strong', className: 'bg-[#86f0be]' },
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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 text-[#edf6ff]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(120,230,255,0.14),transparent_20%),radial-gradient(circle_at_84%_18%,rgba(255,123,99,0.12),transparent_18%),radial-gradient(circle_at_55%_76%,rgba(255,199,106,0.08),transparent_24%)]" />

      <section className="relative grid w-full max-w-[1180px] overflow-hidden rounded-[36px] border border-[rgba(141,232,255,0.16)] bg-[linear-gradient(180deg,rgba(8,18,34,0.94),rgba(4,10,20,0.98))] shadow-[0_28px_90px_rgba(0,0,0,0.3)] lg:grid-cols-[1fr_1fr]">
        <aside className="hidden border-r border-[rgba(141,232,255,0.12)] bg-[linear-gradient(135deg,rgba(120,230,255,0.08),rgba(255,199,106,0.08))] p-9 lg:grid">
          <div className="grid content-between gap-8">
            <div className="grid gap-5">
              <div className="inline-flex items-center gap-3">
                <div className="inline-flex h-[56px] w-[56px] items-center justify-center rounded-[20px] border border-[rgba(120,230,255,0.28)] bg-[rgba(120,230,255,0.12)]">
                  <GamepadIcon />
                </div>
                <div>
                  <div className="font-['Rajdhani'] text-[2.5rem] font-bold uppercase tracking-[0.08em]">
                    PlayHub
                  </div>
                  <div className="text-[0.78rem] uppercase tracking-[0.26em] text-[#97dafc]/70">
                    New challenger
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                <h1 className="font-['Rajdhani'] text-[4.5rem] font-bold uppercase leading-[0.88] tracking-[0.05em] text-[#f6fbff]">
                  Build your
                  <span className="block text-[#ffc76a]">player tag.</span>
                </h1>
                <p className="max-w-[420px] text-[1rem] leading-8 text-[#d6e8f8]/68">
                  Crea tu perfil, entra al lobby y empieza a construir historial, rachas y
                  posicion en cada arena competitiva.
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              <article className="rounded-[24px] border border-[rgba(255,199,106,0.16)] bg-[rgba(255,199,106,0.07)] p-5">
                <p className="text-[0.78rem] uppercase tracking-[0.22em] text-[#ffd8a2]/62">
                  Why join
                </p>
                <p className="mt-3 text-[1.7rem] font-semibold leading-tight text-[#fff7eb]">
                  Salas privadas, stats visibles y progreso que se siente en cada partida.
                </p>
              </article>
            </div>
          </div>
        </aside>

        <div className="p-6 sm:p-8 lg:p-10">
          <div className="mx-auto w-full max-w-[480px]">
            <div className="mb-8 lg:hidden">
              <div className="inline-flex items-center gap-3">
                <div className="inline-flex h-[52px] w-[52px] items-center justify-center rounded-[18px] border border-[rgba(120,230,255,0.28)] bg-[rgba(120,230,255,0.12)]">
                  <GamepadIcon />
                </div>
                <div>
                  <div className="font-['Rajdhani'] text-[2.2rem] font-bold uppercase tracking-[0.08em]">
                    PlayHub
                  </div>
                  <div className="text-[0.76rem] uppercase tracking-[0.24em] text-[#97dafc]/68">
                    New challenger
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              <p className="text-[0.82rem] uppercase tracking-[0.24em] text-[#97dafc]/62">
                Register
              </p>
              <h2 className="text-[2.4rem] font-bold tracking-[-0.05em] text-[#f7fbff]">
                Create your account
              </h2>
              <p className="text-[#d6e8f8]/66">
                Crea tu perfil competitivo y entra al ecosistema de partidas, rankings y stats.
              </p>
            </div>

            <div className="mt-8 grid gap-4">
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
                        className={`h-2 rounded-full ${
                          index < strength ? level.className : 'bg-white/8'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[0.86rem] text-[#d4ecff]/62">
                    Password strength:{' '}
                    {fields.password ? strengthCopy.label : 'Start typing to measure'}
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

            <div className="mt-6 grid gap-4">
              <Button fullWidth isLoading={isLoading} onClick={handleCreateAccount}>
                {isLoading ? 'Creating account...' : 'Create challenger profile'}
              </Button>

              <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <Button variant="ghost" onClick={() => navigate('/login')}>
                  Already have an account?
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Register;
