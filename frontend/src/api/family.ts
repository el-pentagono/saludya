import apiClient from './client';
import type { Appointment, ConsentimientoMenor, MenorACargo } from '../types';

export interface CrearConsentimientoInput {
  textoAceptado: string;
  versionPolitica?: string;
}

export interface CrearMenorInput {
  nombre: string;
  apellido: string;
  dni: string;
  fechaNacimiento: string;
  relacion: string;
  grupoSanguineo?: string;
  alergias?: string;
  antecedentes?: string;
  pediatraCabecera?: string;
  documentoRespaldoUrl?: string;
  documentoRespaldoNombre?: string;
  documentoRespaldoTipo?: string;
}

export interface ActualizarSaludInput {
  grupoSanguineo?: string;
  alergias?: string;
  antecedentes?: string;
  pediatraCabecera?: string;
}

export interface AdjuntarDocumentoInput {
  documentoUrl: string;
  nombreArchivo: string;
  tipoDocumento: string;
}

export const obtenerConsentimiento = () =>
  apiClient.get<ConsentimientoMenor | null>('/api/familia/consentimiento').then((r) => r.data);

export const aceptarConsentimiento = (input: CrearConsentimientoInput) =>
  apiClient.post<ConsentimientoMenor>('/api/familia/consentimiento', input).then((r) => r.data);

export const listarMenores = () =>
  apiClient.get<MenorACargo[]>('/api/familia/menores').then((r) => r.data);

export const obtenerMenor = (id: string) =>
  apiClient.get<MenorACargo>(`/api/familia/menores/${id}`).then((r) => r.data);

export const crearMenor = (input: CrearMenorInput) =>
  apiClient.post<MenorACargo>('/api/familia/menores', input).then((r) => r.data);

export const actualizarSaludMenor = (id: string, input: ActualizarSaludInput) =>
  apiClient.patch<MenorACargo>(`/api/familia/menores/${id}`, input).then((r) => r.data);

export const adjuntarDocumentoMenor = (id: string, input: AdjuntarDocumentoInput) =>
  apiClient.post<MenorACargo>(`/api/familia/menores/${id}/documento`, input).then((r) => r.data);

export const eliminarMenor = (id: string) =>
  apiClient.delete<{ success: boolean }>(`/api/familia/menores/${id}`).then((r) => r.data);

export const listarTurnosMenor = (id: string) =>
  apiClient.get<Appointment[]>(`/api/familia/menores/${id}/turnos`).then((r) => r.data);
