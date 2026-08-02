import apiClient from './client';
import type { MedicalRecordEntry } from '../types';

export const listarHistoriaClinica = (pacienteId: string) =>
  apiClient
    .get<MedicalRecordEntry[]>(`/api/medical-records/paciente/${pacienteId}`)
    .then((r) => r.data);
