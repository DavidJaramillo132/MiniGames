import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Spinner from '../ui/Spinner';

function AuthLoadingScreen() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#050b15] text-[#edf6ff]">
      <div className="inline-flex items-center gap-3 rounded-[18px] border border-[rgba(141,232,255,0.14)] bg-[rgba(255,255,255,0.03)] px-5 py-4">
        <Spinner size={22} />
        <span>Validando sesion...</span>
      </div>
    </main>
  );
}

function ProtectedRoute() {
  const location = useLocation();
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
