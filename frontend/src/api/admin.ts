import apiClient from './client';
import type { AdminResumen } from '../types';

export const obtenerResumenAdmin = () =>
  apiClient.get<AdminResumen>('/api/admin/resumen').then((r) => r.data);
