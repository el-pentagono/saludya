import apiClient from './client';
import type { Medico } from '../types';

export const listarMedicos = () =>
  apiClient.get<Medico[]>('/api/usuarios/medicos').then((r) => r.data);
