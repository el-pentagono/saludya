import apiClient from './client';
import type { Notification } from '../types';

export const listarNotificaciones = () =>
  apiClient.get<Notification[]>('/api/notifications').then((r) => r.data);

export const contarNotificacionesNoLeidas = () =>
  apiClient.get<number>('/api/notifications/no-leidas/conteo').then((r) => r.data);

export const marcarNotificacionLeida = (id: string) =>
  apiClient.patch<Notification>(`/api/notifications/${id}/leer`).then((r) => r.data);

export const marcarTodasNotificacionesLeidas = () =>
  apiClient.patch<{ actualizadas: number }>('/api/notifications/leer-todas').then((r) => r.data);
