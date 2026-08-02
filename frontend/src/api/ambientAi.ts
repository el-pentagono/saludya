import apiClient from './client';
import type { TranscripcionConsulta } from '../types';

export const listarTranscripciones = () =>
  apiClient
    .get<TranscripcionConsulta[]>('/api/ambient-ai/transcripciones')
    .then((r) => r.data);

export const generarTranscripcion = (appointmentId: string, transcripcionCruda?: string) =>
  apiClient
    .post<TranscripcionConsulta>('/api/ambient-ai/transcripciones', {
      appointmentId,
      transcripcionCruda,
    })
    .then((r) => r.data);

export const confirmarTranscripcion = (id: string, diagnostico: string, notasFinales?: string) =>
  apiClient
    .patch<TranscripcionConsulta>(`/api/ambient-ai/transcripciones/${id}/confirmar`, {
      diagnostico,
      notasFinales,
    })
    .then((r) => r.data);
