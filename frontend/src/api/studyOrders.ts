import apiClient from './client';
import type { StudyOrder } from '../types';

export interface CrearOrdenEstudioInput {
  pacienteId: string;
  appointmentId?: string;
  tipoEstudio: string;
  lugar: string;
  fechaSugerida: string;
  indicaciones?: string;
}

export interface MarcarEstudioRealizadoInput {
  fechaControlSugerida?: string;
}

export const listarOrdenesEstudio = () =>
  apiClient.get<StudyOrder[]>('/api/study-orders').then((r) => r.data);

export const buscarOrdenEstudioPorId = (id: string) =>
  apiClient.get<StudyOrder>(`/api/study-orders/${id}`).then((r) => r.data);

export const crearOrdenEstudio = (input: CrearOrdenEstudioInput) =>
  apiClient.post<StudyOrder>('/api/study-orders', input).then((r) => r.data);

export const marcarEstudioRealizado = (id: string, input?: MarcarEstudioRealizadoInput) =>
  apiClient
    .patch<StudyOrder>(`/api/study-orders/${id}/realizar`, input ?? {})
    .then((r) => r.data);
