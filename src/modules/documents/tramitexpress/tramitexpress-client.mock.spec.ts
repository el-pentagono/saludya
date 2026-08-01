import { ConfigService } from '@nestjs/config';
import { MockTramitExpressClient } from './tramitexpress-client.mock';

describe('MockTramitExpressClient', () => {
  it('devuelve un resultado con la forma del contrato TramitExpressClient', async () => {
    const configService = { get: jest.fn(() => 'http://localhost:3020') } as unknown as ConfigService;
    const client = new MockTramitExpressClient(configService);

    const resultado = await client.generarCertificado({
      tipo: 'constancia_atencion',
      pacienteId: 'paciente-1',
      pacienteNombre: 'Ana Gómez',
      contenido: {},
    });

    expect(resultado.tramiteId).toEqual(expect.any(String));
    expect(resultado.numeroConstancia).toContain('CONSTANCIA_ATENCION');
    expect(resultado.urlDescarga).toContain('http://localhost:3020');
    expect(resultado.fechaEmision).toBeInstanceOf(Date);
  });
});
