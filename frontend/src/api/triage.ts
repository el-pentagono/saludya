import apiClient from './client';
import type { PrioridadTriaje, TriajeCaso } from '../types';

export interface CrearTriajeInput {
  pacienteId: string;
  observaciones: string;
  prioridad: PrioridadTriaje;
}

export const listarTriaje = () =>
  apiClient.get<TriajeCaso[]>('/api/triaje').then((r) => r.data);

export const crearTriaje = (input: CrearTriajeInput) =>
  apiClient.post<TriajeCaso>('/api/triaje', input).then((r) => r.data);

export const cancelarTriaje = (id: string) =>
  apiClient.patch<TriajeCaso>(`/api/triaje/${id}/cancelar`).then((r) => r.data);
