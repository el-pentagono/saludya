import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ fallbackUrl = '/login' }: { fallbackUrl?: string }) {
  const { usuario } = useAuth();
  if (!usuario) return <Navigate to={fallbackUrl} replace />;
  return <Outlet />;
}
