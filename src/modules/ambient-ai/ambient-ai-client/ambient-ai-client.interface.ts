export const AMBIENT_AI_CLIENT = 'AMBIENT_AI_CLIENT';

export interface GenerarResumenInput {
  transcripcionCruda?: string;
  contexto: {
    pacienteNombre: string;
    medicoNombre: string;
    motivo?: string;
  };
}

export interface GenerarResumenResultado {
  transcripcionCruda: string;
  resumen: string;
  puntosClave: string[];
}

/**
 * Contrato del servicio de IA ambiental. Hoy lo implementa MockAmbientAiClient
 * (sin pipeline de audio real: si no llega transcripcionCruda, la simula).
 * El día que exista un servicio real de transcripción/resumen, se reemplaza el
 * provider del token AMBIENT_AI_CLIENT sin tocar AmbientAiService ni el controller.
 */
export interface AmbientAiClient {
  generarResumen(input: GenerarResumenInput): Promise<GenerarResumenResultado>;
}
