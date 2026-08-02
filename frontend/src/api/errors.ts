import { AxiosError } from 'axios';

export function extraerMensajeError(error: unknown, fallback: string): string {
  const mensaje = (error as AxiosError<{ mensaje?: string | string[] }>)?.response?.data?.mensaje;
  if (Array.isArray(mensaje)) return mensaje.join(' ');
  if (typeof mensaje === 'string') return mensaje;
  return fallback;
}
