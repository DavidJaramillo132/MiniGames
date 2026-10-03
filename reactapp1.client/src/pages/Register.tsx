import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import type { RegistrationFields } from '../types/auth.types';
import { useI18n } from '../i18n/LanguageContext';
import { GamepadIcon } from '../components/ui/Icons';

const strengthLevels = [
  { label: 'Weak', className: 'bg-[#ff3355]' },
  { label: 'Fair', className: 'bg-[#ffaa00]' },
  { label: 'Good', className: 'bg-[#f4f4f6]' },
  { label: 'Strong', className: 'bg-[#d4ff00]' },
];

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
  const { t } = useI18n();
  const navigate = useNavigate();
  const { error, register } = useAuth();
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
    if (fields.password !== fields.confirmPassword) {
      return;
    }

    setIsLoading(true);

    try {
      await register(fields);
      navigate('/home', { replace: true });
    } catch {
      // The auth store exposes a friendly error message for the form.
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 text-[#f4f4f6]">
      <section className="relative grid w-full max-w-[1140px] overflow-hidden rounded-[26px] border border-white/[0.08] bg-[#111114] shadow-[0_24px_70px_rgba(0,0,0,0.8)] lg:grid-cols-[1fr_1fr]">
        <aside className="hidden border-r border-white/[0.08] bg-[#0d0d10] p-9 lg:grid">
          <div className="grid content-between gap-8">
            <div className="grid gap-6">
              <div className="inline-flex items-center gap-3">
                <div className="inline-flex h-[52px] w-[52px] items-center justify-center rounded-[16px] border border-[#d4ff00]/30 bg-[#d4ff00]/10 shadow-[0_0_16px_rgba(212,255,0,0.2)] text-[#d4ff00]">
                  <GamepadIcon />
                </div>
                <div className="font-['Rajdhani'] text-[2.4rem] font-bold uppercase tracking-[0.06em] text-[#f4f4f6]">
                  PlayHub
                </div>
              </div>

              <div className="grid gap-3">
                <h1 className="font-['Rajdhani'] text-[4rem] font-bold uppercase leading-[0.9] tracking-[0.03em] text-[#f4f4f6]">
                  {t('buildTag')}
                  <span className="block text-[#d4ff00]">{t('playerTag')}</span>
                </h1>
                <p className="max-w-[420px] text-[0.95rem] leading-relaxed text-[#8c8c9a]">
                  {t('registerDescription')}
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              <article className="rounded-[18px] border border-white/[0.08] bg-[#17171d] p-5">
                <p className="text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[#d4ff00]">
                  {t('whyJoin')}
                </p>
                <p className="mt-2 font-['Rajdhani'] text-[1.6rem] font-bold uppercase tracking-tight text-[#f4f4f6]">
                  {t('registerPromo')}
                </p>
              </article>
            </div>
          </div>
        </aside>

        <div className="p-6 sm:p-8 lg:p-10">
          <div className="mx-auto w-full max-w-[460px]">
            <div className="mb-6 lg:hidden">
              <div className="inline-flex items-center gap-3">
                <div className="inline-flex h-[48px] w-[48px] items-center justify-center rounded-[14px] border border-[#d4ff00]/30 bg-[#d4ff00]/10 text-[#d4ff00]">
                  <GamepadIcon />
                </div>
                <div className="font-['Rajdhani'] text-[2.2rem] font-bold uppercase tracking-[0.06em] text-[#f4f4f6]">
                  PlayHub
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <h2 className="font-['Rajdhani'] text-3xl sm:text-4xl font-bold uppercase tracking-wide text-[#f4f4f6]">
                {t('createYourAccount')}
              </h2>
              <p className="text-sm text-[#8c8c9a]">
                {t('registerPrompt')}
              </p>
            </div>

            <div className="mt-8 grid gap-4">
              {error ? (
                <div className="rounded-[18px] border border-[#ff3355]/30 bg-[#ff3355]/10 px-4 py-3 text-sm text-[#ffd5ce]">
                  {error}
                </div>
              ) : null}

              <Input
                label={t('username')}
                type="text"
                placeholder={t('chooseUsername')}
                value={fields.username}
                onChange={(value) => setFields((current) => ({ ...current, username: value }))}
              />

              <Input
                label={t('email')}
                type="email"
                placeholder="you@example.com"
                value={fields.email}
                onChange={(value) => setFields((current) => ({ ...current, email: value }))}
              />

              <div className="grid gap-2">
                <Input
                  label={t('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('createPassword')}
                  value={fields.password}
                  onChange={(value) => setFields((current) => ({ ...current, password: value }))}
                  actionLabel={showPassword ? t('hide') : t('show')}
                  onActionClick={() => setShowPassword((current) => !current)}
                />
                <div className="grid gap-2">
                  <div className="grid grid-cols-4 gap-2">
                    {strengthLevels.map((level, index) => (
                      <span
                        key={level.label}
                        className={`h-2 rounded-full ${
                          index < strength ? level.className : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[0.86rem] text-[#8c8c9a]">
                    {t('passwordStrength')} {' '}
                    {fields.password ? t(strengthCopy.label.toLowerCase() as 'weak' | 'fair' | 'good' | 'strong') : t('startTyping')}
                  </span>
                </div>
              </div>

              <Input
                label={t('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder={t('repeatPassword')}
                value={fields.confirmPassword}
                onChange={(value) =>
                  setFields((current) => ({ ...current, confirmPassword: value }))
                }
                actionLabel={showConfirmPassword ? t('hide') : t('show')}
                onActionClick={() => setShowConfirmPassword((current) => !current)}
                helpText={
                  fields.confirmPassword && fields.password !== fields.confirmPassword
                     ? t('passwordsMismatch')
                    : undefined
                }
              />
            </div>

            <div className="mt-6 grid gap-4">
              <Button
                fullWidth
                isLoading={isLoading}
                onClick={handleCreateAccount}
                disabled={Boolean(fields.confirmPassword && fields.password !== fields.confirmPassword)}
              >
                {isLoading ? t('creatingAccount') : t('createProfile')}
              </Button>

              <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <Button variant="ghost" onClick={() => navigate('/login')}>
                  {t('alreadyAccount')}
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
