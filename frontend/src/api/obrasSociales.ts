import apiClient from './client';
import type { ObraSocial } from '../types';

export const listarObrasSociales = () =>
  apiClient.get<ObraSocial[]>('/api/obras-sociales').then((r) => r.data);
