import apiClient from './client';
import type { BloqueDisponibilidad } from '../types';

export interface CreateBloquePayload {
  titulo: string;
  esRecurrente?: boolean;
  diaSemana?: number;
  fechaPuntual?: string;
  horaInicio: string;
  horaFin: string;
}

export const listarMisBloquesDisponibilidad = () =>
  apiClient.get<BloqueDisponibilidad[]>('/api/disponibilidad/mis-bloques').then((r) => r.data);

export const crearBloqueDisponibilidad = (data: CreateBloquePayload) =>
  apiClient.post<BloqueDisponibilidad>('/api/disponibilidad/mis-bloques', data).then((r) => r.data);

export const eliminarBloqueDisponibilidad = (id: string) =>
  apiClient.delete<{ success: boolean }>(`/api/disponibilidad/mis-bloques/${id}`).then((r) => r.data);
