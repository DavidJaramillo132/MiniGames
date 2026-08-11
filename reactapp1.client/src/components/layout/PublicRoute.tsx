import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Spinner from '../ui/Spinner';
import { useI18n } from '../../i18n/LanguageContext';

function PublicRoute() {
  const { isAuthenticated, isInitializing } = useAuth();
  const { t } = useI18n();

  if (isInitializing) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#050b15] text-[#edf6ff]">
        <div className="inline-flex items-center gap-3 rounded-[18px] border border-[rgba(141,232,255,0.14)] bg-[rgba(255,255,255,0.03)] px-5 py-4">
          <Spinner size={22} />
          <span>{t('loadingSession')}</span>
        </div>
      </main>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}

export default PublicRoute;
