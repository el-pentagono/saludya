import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import * as authApi from '../api/auth';
import { TOKEN_KEY, USUARIO_KEY } from '../api/client';
import type { UsuarioResumen } from '../types';

interface AuthContextValue {
  usuario: UsuarioResumen | null;
  cargando: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: authApi.RegisterInput) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioResumen | null>(() => {
    const guardado = localStorage.getItem(USUARIO_KEY);
    return guardado ? JSON.parse(guardado) : null;
  });
  const [cargando, setCargando] = useState(false);

  const guardarSesion = (accessToken: string, usuarioResumen: UsuarioResumen) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(USUARIO_KEY, JSON.stringify(usuarioResumen));
    setUsuario(usuarioResumen);
  };

  const login = async (email: string, password: string) => {
    setCargando(true);
    try {
      const { accessToken, usuario: usuarioResumen } = await authApi.login(email, password);
      guardarSesion(accessToken, usuarioResumen);
    } finally {
      setCargando(false);
    }
  };

  const register = async (input: authApi.RegisterInput) => {
    setCargando(true);
    try {
      const { accessToken, usuario: usuarioResumen } = await authApi.register(input);
      guardarSesion(accessToken, usuarioResumen);
    } finally {
      setCargando(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
