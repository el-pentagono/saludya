import apiClient from './client';
import type { CierreExpressResultado } from '../types';

export const cerrarTurnoExpress = (appointmentId: string, diagnostico: string) =>
  apiClient
    .patch<CierreExpressResultado>(`/api/cierre-express/${appointmentId}`, { diagnostico })
    .then((r) => r.data);
