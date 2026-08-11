import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ErrorFallback from '../components/ui/ErrorFallback';
import { useAuth } from '../hooks/useAuth';
import type { LoginCredentials } from '../types/auth.types';
import { useI18n } from '../i18n/LanguageContext';

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
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const { error, login } = auth;
  const [credentials, setCredentials] = useState<LoginCredentials>({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await login(credentials);
      const from = (location.state as { from?: string } | null)?.from ?? '/home';
      navigate(from, { replace: true });
    } catch {
      // The auth store exposes the error message for the form.
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 text-[#edf6ff]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(120,230,255,0.16),transparent_20%),radial-gradient(circle_at_85%_18%,rgba(255,123,99,0.12),transparent_18%),radial-gradient(circle_at_50%_75%,rgba(77,163,255,0.12),transparent_28%)]" />

      <section className="relative grid w-full max-w-[1160px] overflow-hidden rounded-[36px] border border-[rgba(141,232,255,0.16)] bg-[linear-gradient(180deg,rgba(8,18,34,0.94),rgba(4,10,20,0.98))] shadow-[0_28px_90px_rgba(0,0,0,0.3)] lg:grid-cols-[0.95fr_1.05fr]">
        <aside className="hidden border-r border-[rgba(141,232,255,0.12)] bg-[linear-gradient(135deg,rgba(120,230,255,0.08),rgba(255,123,99,0.08))] p-9 lg:grid">
          <div className="grid content-between gap-8">
            <div className="grid gap-5">
              <div className="inline-flex items-center gap-3">
                <div className="inline-flex h-[56px] w-[56px] items-center justify-center rounded-[20px] border border-[rgba(120,230,255,0.28)] bg-[rgba(120,230,255,0.12)]">
                  <GamepadIcon />
                </div>
                <div>
                  <div className="font-['Rajdhani'] text-[2.5rem] font-bold uppercase tracking-[0.08em]">PlayHub</div>
                  <div className="text-[0.78rem] uppercase tracking-[0.26em] text-[#97dafc]/70">{t('loginReturn')}</div>
                </div>
              </div>

              <div className="grid gap-4">
                <h1 className="font-['Rajdhani'] text-[4.6rem] font-bold uppercase leading-[0.88] tracking-[0.05em] text-[#f6fbff]">
                  {t('backToArena')}
                  <span className="block text-[#78e6ff]">{t('theArena')}</span>
                </h1>
                <p className="max-w-[420px] text-[1rem] leading-8 text-[#d6e8f8]/68">
                  {t('loginDescription')}
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              <article className="rounded-[24px] border border-[rgba(141,232,255,0.12)] bg-[rgba(255,255,255,0.03)] p-5">
                <p className="text-[0.78rem] uppercase tracking-[0.22em] text-[#97dafc]/62">{t('todayOn')}</p>
                <p className="mt-3 text-[1.7rem] font-semibold text-[#f7fbff]">{t('loginPromo')}</p>
              </article>
            </div>
          </div>
        </aside>

        <div className="p-6 sm:p-8 lg:p-10">
          <div className="mx-auto w-full max-w-[460px]">
            <div className="mb-8 lg:hidden">
              <div className="inline-flex items-center gap-3">
                <div className="inline-flex h-[52px] w-[52px] items-center justify-center rounded-[18px] border border-[rgba(120,230,255,0.28)] bg-[rgba(120,230,255,0.12)]">
                  <GamepadIcon />
                </div>
                <div>
                  <div className="font-['Rajdhani'] text-[2.2rem] font-bold uppercase tracking-[0.08em]">PlayHub</div>
                  <div className="text-[0.76rem] uppercase tracking-[0.24em] text-[#97dafc]/68">{t('loginReturn')}</div>
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              <p className="text-[0.82rem] uppercase tracking-[0.24em] text-[#97dafc]/62">{t('signIn')}</p>
              <h2 className="text-[2.4rem] font-bold tracking-[-0.05em] text-[#f7fbff]">{t('welcomeBack')}</h2>
              <p className="text-[#d6e8f8]/66">{t('loginPrompt')}</p>
            </div>

            <div className="mt-8 grid gap-4">
              {error ? (
                <ErrorFallback message={error} onRetry={() => void handleSignIn()} />
              ) : null}

              <Input
                label={t('email')}
                type="email"
                placeholder="you@example.com"
                value={credentials.email}
                onChange={(value) => setCredentials((current) => ({ ...current, email: value }))}
              />

              <Input
                label={t('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder={t('enterPassword')}
                value={credentials.password}
                onChange={(value) => setCredentials((current) => ({ ...current, password: value }))}
                actionLabel={showPassword ? t('hide') : t('show')}
                onActionClick={() => setShowPassword((current) => !current)}
              />
            </div>

            <div className="mt-6 grid gap-4">
              <Button fullWidth isLoading={isLoading} onClick={handleSignIn}>
                {isLoading ? t('signingIn') : t('enterLobby')}
              </Button>

              <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <Button variant="ghost" onClick={() => navigate('/register')}>{t('createAccount')}</Button>
                <Button variant="ghost" onClick={() => undefined}>{t('forgotPassword')}</Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Login;
