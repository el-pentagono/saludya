import apiClient from './client';

export interface SalaTeleconsult {
  proveedor: string;
  salaUrl: string;
}

export const obtenerSalaTeleconsult = (appointmentId: string) =>
  apiClient
    .get<SalaTeleconsult>(`/api/teleconsult/turno/${appointmentId}/sala`)
    .then((r) => r.data);
