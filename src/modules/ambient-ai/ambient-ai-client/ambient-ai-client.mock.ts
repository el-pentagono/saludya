import { Injectable } from '@nestjs/common';
import {
  AmbientAiClient,
  GenerarResumenInput,
  GenerarResumenResultado,
} from './ambient-ai-client.interface';

@Injectable()
export class MockAmbientAiClient implements AmbientAiClient {
  async generarResumen(input: GenerarResumenInput): Promise<GenerarResumenResultado> {
    const { pacienteNombre, medicoNombre, motivo } = input.contexto;

    const transcripcionCruda =
      input.transcripcionCruda?.trim() ||
      `[Simulado] Consulta entre ${medicoNombre} y ${pacienteNombre}. Motivo: ${motivo ?? 'no especificado'}.`;

    const resumen = `Resumen generado automáticamente de la consulta con ${pacienteNombre}${
      motivo ? ` (motivo: ${motivo})` : ''
    }.`;

    return {
      transcripcionCruda,
      resumen,
      puntosClave: [
        'Revisar y confirmar con el profesional antes de guardar en la historia clínica',
        `Paciente: ${pacienteNombre}`,
        `Médico: ${medicoNombre}`,
      ],
    };
  }
}
