import apiClient from './client';
import type { Usuario, UsuarioResumen } from '../types';

export interface RegisterInput {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  dni: string;
  telefono?: string;
  obraSocialId?: string;
  numeroAfiliado?: string;
}

export interface AuthResponse {
  accessToken: string;
  usuario: UsuarioResumen;
}

export const login = (email: string, password: string) =>
  apiClient.post<AuthResponse>('/api/auth/login', { email, password }).then((r) => r.data);

export const register = (input: RegisterInput) =>
  apiClient.post<AuthResponse>('/api/auth/register', input).then((r) => r.data);

export const obtenerPerfil = () => apiClient.get<Usuario>('/api/usuarios/yo').then((r) => r.data);
