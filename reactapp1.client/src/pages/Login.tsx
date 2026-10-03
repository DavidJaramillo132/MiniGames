import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ErrorFallback from '../components/ui/ErrorFallback';
import { useAuth } from '../hooks/useAuth';
import type { LoginCredentials } from '../types/auth.types';
import { useI18n } from '../i18n/LanguageContext';

import { GamepadIcon } from '../components/ui/Icons';

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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 text-[#f4f4f6]">
      <section className="relative grid w-full max-w-[1120px] overflow-hidden rounded-[26px] border border-white/[0.08] bg-[#111114] shadow-[0_24px_70px_rgba(0,0,0,0.8)] lg:grid-cols-[0.95fr_1.05fr]">
        <aside className="hidden border-r border-white/[0.08] bg-[#0d0d10] p-9 lg:grid">
          <div className="grid content-between gap-8">
            <div className="grid gap-6">
              <div className="inline-flex items-center gap-3">
                <div className="inline-flex h-[52px] w-[52px] items-center justify-center rounded-[16px] border border-[#d4ff00]/30 bg-[#d4ff00]/10 shadow-[0_0_16px_rgba(212,255,0,0.2)] text-[#d4ff00]">
                  <GamepadIcon />
                </div>
                <div className="font-['Rajdhani'] text-[2.4rem] font-bold uppercase tracking-[0.06em] text-[#f4f4f6]">PlayHub</div>
              </div>

              <div className="grid gap-3">
                <h1 className="font-['Rajdhani'] text-[4rem] font-bold uppercase leading-[0.9] tracking-[0.03em] text-[#f4f4f6]">
                  {t('backToArena')}
                  <span className="block text-[#d4ff00]">{t('theArena')}</span>
                </h1>
                <p className="max-w-[420px] text-[0.95rem] leading-relaxed text-[#8c8c9a]">
                  {t('loginDescription')}
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              <article className="rounded-[18px] border border-white/[0.08] bg-[#17171d] p-5">
                <p className="text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[#d4ff00]">{t('todayOn')}</p>
                <p className="mt-2 font-['Rajdhani'] text-[1.6rem] font-bold uppercase tracking-tight text-[#f4f4f6]">{t('loginPromo')}</p>
              </article>
            </div>
          </div>
        </aside>

        <div className="p-6 sm:p-8 lg:p-10">
          <div className="mx-auto w-full max-w-[440px]">
            <div className="mb-6 lg:hidden">
              <div className="inline-flex items-center gap-3">
                <div className="inline-flex h-[48px] w-[48px] items-center justify-center rounded-[14px] border border-[#d4ff00]/30 bg-[#d4ff00]/10 text-[#d4ff00]">
                  <GamepadIcon />
                </div>
                <div className="font-['Rajdhani'] text-[2.2rem] font-bold uppercase tracking-[0.06em] text-[#f4f4f6]">PlayHub</div>
              </div>
            </div>

            <div className="grid gap-2">
              <h2 className="font-['Rajdhani'] text-3xl sm:text-4xl font-bold uppercase tracking-wide text-[#f4f4f6]">{t('welcomeBack')}</h2>
              <p className="text-sm text-[#8c8c9a]">{t('loginPrompt')}</p>
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
