import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Rol } from '../types';

export function RequireRole({ roles, redirectUrl }: { roles: Rol[]; redirectUrl?: string }) {
  const { usuario } = useAuth();
  if (!usuario) return <Navigate to="/login" replace />;

  if (!roles.includes(usuario.rol)) {
    if (redirectUrl) return <Navigate to={redirectUrl} replace />;
    // Si es paciente lo enviamos al portal de pacientes, si es profesional al portal profesional
    return <Navigate to={usuario.rol === 'paciente' ? '/' : '/profesionales'} replace />;
  }

  return <Outlet />;
}
