import apiClient from './client';
import type { RegistroSaludMental } from '../types';

export interface CrearRegistroBovedaInput {
  pacienteId: string;
  notasPrivadas: string;
  resumenPaciente: string;
}

export const listarBoveda = () =>
  apiClient.get<RegistroSaludMental[]>('/api/boveda-salud-mental').then((r) => r.data);

export const crearRegistroBoveda = (input: CrearRegistroBovedaInput) =>
  apiClient.post<RegistroSaludMental>('/api/boveda-salud-mental', input).then((r) => r.data);
