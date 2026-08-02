import apiClient from './client';
import type { DocumentoEmitido } from '../types';

export const listarDocumentos = () =>
  apiClient.get<DocumentoEmitido[]>('/api/documents').then((r) => r.data);

export const generarConstanciaAtencion = (appointmentId: string) =>
  apiClient
    .post<DocumentoEmitido>('/api/documents/constancia-atencion', { appointmentId })
    .then((r) => r.data);
