import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import * as authApi from '../api/auth';
import { DEMO_OFFLINE_TOKEN, TOKEN_KEY, USUARIO_KEY } from '../api/client';
import type { UsuarioResumen } from '../types';

// Cuenta demo oficial de Pacientes (ver DemoSeedService en el backend) -- las
// mismas credenciales que llena el botón "Cargar Paciente Demo" en LoginPage.
export const DEMO_EMAIL = 'demo.paciente@saludya.com.ar';

// Registro de todas las cuentas demo conocidas (Pacientes + los 4 roles de
// Profesionales), usado por loginDemoOffline para saber a quién "loguear"
// localmente cuando el backend no responde. Las credenciales (email/password)
// son las mismas que llenan los botones de acceso rápido en LoginPage y
// ProfessionalLoginPage -- ver DemoSeedService en el backend para el origen.
const DEMO_USUARIOS: Record<string, UsuarioResumen> = {
  [DEMO_EMAIL]: {
    id: 'demo-offline-lucas-benitez',
    email: DEMO_EMAIL,
    nombre: 'Lucas',
    apellido: 'Benítez',
    rol: 'paciente',
  },
  'demo.medico@saludya.com.ar': {
    id: 'demo-offline-dr-navarro',
    email: 'demo.medico@saludya.com.ar',
    nombre: 'Dr.',
    apellido: 'Navarro',
    rol: 'medico',
  },
  'demo.enfermero@saludya.com.ar': {
    id: 'demo-offline-lic-perez',
    email: 'demo.enfermero@saludya.com.ar',
    nombre: 'Lic.',
    apellido: 'Pérez',
    rol: 'enfermero',
  },
  'demo.farmaceutico@saludya.com.ar': {
    id: 'demo-offline-farm-delgado',
    email: 'demo.farmaceutico@saludya.com.ar',
    nombre: 'Farm.',
    apellido: 'Delgado',
    rol: 'farmaceutico',
  },
  'demo.director@saludya.com.ar': {
    id: 'demo-offline-dra-roldan',
    email: 'demo.director@saludya.com.ar',
    nombre: 'Dra.',
    apellido: 'Roldán',
    rol: 'director',
  },
};

interface AuthContextValue {
  usuario: UsuarioResumen | null;
  cargando: boolean;
  modoDemoOffline: boolean;
  login: (email: string, password: string) => Promise<UsuarioResumen>;
  loginDemoOffline: (email: string) => UsuarioResumen | null;
  register: (input: authApi.RegisterInput) => Promise<UsuarioResumen>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Lee la sesión guardada de forma defensiva: si el valor en localStorage
// quedó corrupto o con una forma inesperada (residuo de una versión
// anterior de la app, escritura parcial, lo que sea), no debe tirar abajo
// el arranque de toda la app -- se limpia y arranca como si no hubiera
// sesión guardada, en vez de romper el render con una excepción sin manejar.
function leerUsuarioGuardado(): UsuarioResumen | null {
  const guardado = localStorage.getItem(USUARIO_KEY);
  if (!guardado) return null;
  try {
    const parsed = JSON.parse(guardado);
    if (parsed && typeof parsed === 'object' && typeof parsed.id === 'string' && typeof parsed.email === 'string') {
      return parsed as UsuarioResumen;
    }
    throw new Error('Forma inesperada de usuario guardado');
  } catch {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioResumen | null>(leerUsuarioGuardado);
  const [cargando, setCargando] = useState(false);

  const guardarSesion = (accessToken: string, usuarioResumen: UsuarioResumen) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(USUARIO_KEY, JSON.stringify(usuarioResumen));
    setUsuario(usuarioResumen);
  };

  const login = async (email: string, password: string): Promise<UsuarioResumen> => {
    setCargando(true);
    try {
      const { accessToken, usuario: usuarioResumen } = await authApi.login(email, password);
      guardarSesion(accessToken, usuarioResumen);
      return usuarioResumen;
    } finally {
      setCargando(false);
    }
  };

  // Fallback SOLO para las cuentas demo conocidas (Pacientes y los 4 roles
  // de Profesionales): si el backend real no responde (sin conexión,
  // servidor caído, red del dispositivo bloqueada, etc.), esto deja entrar
  // igual a la interfaz con datos locales, para poder mostrar/testear
  // visualmente la app -- por ejemplo durante una demo comercial -- sin
  // depender de que el servidor esté arriba. No aplica a cuentas reales,
  // esas siempre requieren el login real contra el backend. Devuelve null
  // si el email no corresponde a ninguna cuenta demo conocida.
  const loginDemoOffline = (email: string): UsuarioResumen | null => {
    const demoUsuario = DEMO_USUARIOS[email.trim().toLowerCase()];
    if (!demoUsuario) return null;
    guardarSesion(DEMO_OFFLINE_TOKEN, demoUsuario);
    return demoUsuario;
  };

  const register = async (input: authApi.RegisterInput): Promise<UsuarioResumen> => {
    setCargando(true);
    try {
      const { accessToken, usuario: usuarioResumen } = await authApi.register(input);
      guardarSesion(accessToken, usuarioResumen);
      return usuarioResumen;
    } finally {
      setCargando(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
    setUsuario(null);
  };

  const modoDemoOffline = localStorage.getItem(TOKEN_KEY) === DEMO_OFFLINE_TOKEN;

  return (
    <AuthContext.Provider
      value={{ usuario, cargando, modoDemoOffline, login, loginDemoOffline, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
