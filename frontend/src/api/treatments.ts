import apiClient from './client';
import type { Treatment, TreatmentFollowUp } from '../types';

export interface PrescribirTratamientoInput {
  pacienteId: string;
  medicamento: string;
  dosis: string;
  indicaciones?: string;
}

export const listarTratamientos = () =>
  apiClient.get<Treatment[]>('/api/treatments').then((r) => r.data);

export const prescribirTratamiento = (input: PrescribirTratamientoInput) =>
  apiClient.post<Treatment>('/api/treatments', input).then((r) => r.data);

export const listarSeguimientos = (treatmentId: string) =>
  apiClient
    .get<TreatmentFollowUp[]>(`/api/treatments/${treatmentId}/seguimientos`)
    .then((r) => r.data);

export const agregarSeguimiento = (treatmentId: string, nota: string) =>
  apiClient
    .post<TreatmentFollowUp>(`/api/treatments/${treatmentId}/seguimientos`, { nota })
    .then((r) => r.data);
