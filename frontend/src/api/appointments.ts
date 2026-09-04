import apiClient from './client';
import type { Appointment, ResultadoDisponibilidadCruzada } from '../types';

export interface ReservarTurnoInput {
  medicoId?: string;
  pacienteId?: string;
  menorId?: string;
  fecha: string;
  motivo?: string;
}

export const listarTurnos = () =>
  apiClient.get<Appointment[]>('/api/appointments').then((r) => r.data);

export const reservarTurno = (input: ReservarTurnoInput) =>
  apiClient.post<Appointment>('/api/appointments', input).then((r) => r.data);

export const cancelarTurno = (id: string) =>
  apiClient.patch<Appointment>(`/api/appointments/${id}/cancelar`).then((r) => r.data);

export const obtenerDisponibilidadCruzada = (medicoId?: string, pacienteId?: string) => {
  const params: Record<string, string> = {};
  if (medicoId) params.medicoId = medicoId;
  if (pacienteId) params.pacienteId = pacienteId;
  return apiClient
    .get<ResultadoDisponibilidadCruzada>('/api/appointments/disponibilidad-cruzada', { params })
    .then((r) => r.data);
};
