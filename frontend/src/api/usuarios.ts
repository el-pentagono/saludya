import apiClient from './client';
import type { Medico, PersonaResumen } from '../types';

export const listarMedicos = () =>
  apiClient.get<Medico[]>('/api/usuarios/medicos').then((r) => r.data);

export const buscarPacientePorDni = (dni: string) =>
  apiClient
    .get<PersonaResumen>('/api/usuarios/pacientes/buscar', { params: { dni } })
    .then((r) => r.data);
