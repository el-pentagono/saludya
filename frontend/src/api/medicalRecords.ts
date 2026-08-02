import apiClient from './client';
import type { MedicalRecordEntry } from '../types';

export interface CrearEntradaInput {
  pacienteId: string;
  diagnostico: string;
  notas?: string;
}

export const listarHistoriaClinica = (pacienteId: string) =>
  apiClient
    .get<MedicalRecordEntry[]>(`/api/medical-records/paciente/${pacienteId}`)
    .then((r) => r.data);

export const crearEntradaHistoriaClinica = (input: CrearEntradaInput) =>
  apiClient.post<MedicalRecordEntry>('/api/medical-records', input).then((r) => r.data);
