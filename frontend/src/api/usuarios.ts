import apiClient from './client';
import type { Medico, PersonaResumen, Rol, Usuario } from '../types';

export const listarMedicos = () =>
  apiClient.get<Medico[]>('/api/usuarios/medicos').then((r) => r.data);

export const buscarPacientePorDni = (dni: string) =>
  apiClient
    .get<PersonaResumen>('/api/usuarios/pacientes/buscar', { params: { dni } })
    .then((r) => r.data);

export interface CrearUsuarioInput {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  dni: string;
  rol: Rol;
}

export const listarUsuarios = () =>
  apiClient.get<Usuario[]>('/api/usuarios').then((r) => r.data);

export const crearUsuario = (input: CrearUsuarioInput) =>
  apiClient.post<Usuario>('/api/usuarios', input).then((r) => r.data);

export const desactivarUsuario = (id: string) =>
  apiClient.delete<Usuario>(`/api/usuarios/${id}`).then((r) => r.data);
