import apiClient from './client';
import type { Appointment } from '../types';

export interface ReservarTurnoInput {
  medicoId: string;
  fecha: string;
  motivo?: string;
}

export const listarTurnos = () =>
  apiClient.get<Appointment[]>('/api/appointments').then((r) => r.data);

export const reservarTurno = (input: ReservarTurnoInput) =>
  apiClient.post<Appointment>('/api/appointments', input).then((r) => r.data);

export const cancelarTurno = (id: string) =>
  apiClient.patch<Appointment>(`/api/appointments/${id}/cancelar`).then((r) => r.data);
