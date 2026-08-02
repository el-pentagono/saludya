import { MockAmbientAiClient } from './ambient-ai-client.mock';

describe('MockAmbientAiClient', () => {
  const client = new MockAmbientAiClient();

  it('usa la transcripcionCruda provista si se envía', async () => {
    const resultado = await client.generarResumen({
      transcripcionCruda: 'Paciente refiere dolor de cabeza persistente.',
      contexto: { pacienteNombre: 'Ana Gómez', medicoNombre: 'Dr. Pérez', motivo: 'Control' },
    });

    expect(resultado.transcripcionCruda).toBe('Paciente refiere dolor de cabeza persistente.');
    expect(resultado.resumen).toContain('Ana Gómez');
    expect(resultado.puntosClave.length).toBeGreaterThan(0);
  });

  it('simula la transcripcionCruda si no se envía', async () => {
    const resultado = await client.generarResumen({
      contexto: { pacienteNombre: 'Ana Gómez', medicoNombre: 'Dr. Pérez' },
    });

    expect(resultado.transcripcionCruda).toContain('Simulado');
    expect(resultado.transcripcionCruda).toContain('Ana Gómez');
  });
});
