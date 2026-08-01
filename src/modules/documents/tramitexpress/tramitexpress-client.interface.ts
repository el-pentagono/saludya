export const TRAMITEXPRESS_CLIENT = 'TRAMITEXPRESS_CLIENT';

export interface GenerarCertificadoInput {
  tipo: string;
  pacienteId: string;
  pacienteNombre: string;
  contenido: Record<string, unknown>;
}

export interface GenerarCertificadoResultado {
  tramiteId: string;
  numeroConstancia: string;
  urlDescarga: string;
  fechaEmision: Date;
}

/**
 * Contrato del cliente de TramitExpress. Hoy lo implementa MockTramitExpressClient
 * (datos simulados). Cuando @el-pentagono/tramitexpress-sdk esté instalado, se
 * reemplaza el provider del token TRAMITEXPRESS_CLIENT por una implementación
 * real de esta misma interfaz, sin tocar DocumentsService ni los controllers.
 */
export interface TramitExpressClient {
  generarCertificado(input: GenerarCertificadoInput): Promise<GenerarCertificadoResultado>;
}
