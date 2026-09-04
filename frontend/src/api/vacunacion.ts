import apiClient from './client';
import type { AplicacionVacuna, CatalogoVacuna, MenorEncontrado } from '../types';

export const obtenerCatalogoVacunas = () =>
  apiClient.get<CatalogoVacuna[]>('/api/vacunacion/catalogo').then((r) => r.data);

export const obtenerLibretaMenor = (menorId: string) =>
  apiClient.get<AplicacionVacuna[]>(`/api/vacunacion/menores/${menorId}/libreta`).then((r) => r.data);

export const buscarMenorPorDni = (dni: string) =>
  apiClient
    .get<MenorEncontrado>('/api/vacunacion/menores/buscar', { params: { dni } })
    .then((r) => r.data);

export interface RegistrarAplicacionInput {
  fechaAplicacion?: string;
  loteVacuna?: string;
  lugarAplicacion?: string;
  notas?: string;
}

export const registrarAplicacionVacuna = (aplicacionId: string, input: RegistrarAplicacionInput) =>
  apiClient
    .post<AplicacionVacuna>(`/api/vacunacion/aplicaciones/${aplicacionId}/registrar`, input)
    .then((r) => r.data);

export const vincularTurnoVacuna = (aplicacionId: string, appointmentId: string) =>
  apiClient
    .post<AplicacionVacuna>(`/api/vacunacion/aplicaciones/${aplicacionId}/vincular-turno`, {
      appointmentId,
    })
    .then((r) => r.data);
