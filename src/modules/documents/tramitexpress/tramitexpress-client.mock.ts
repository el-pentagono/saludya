import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import {
  GenerarCertificadoInput,
  GenerarCertificadoResultado,
  TramitExpressClient,
} from './tramitexpress-client.interface';

@Injectable()
export class MockTramitExpressClient implements TramitExpressClient {
  constructor(private readonly configService: ConfigService) {}

  async generarCertificado(input: GenerarCertificadoInput): Promise<GenerarCertificadoResultado> {
    const tramiteId = randomUUID();
    const host = this.configService.get<string>('tramitexpress.host');

    return {
      tramiteId,
      numeroConstancia: `TE-${input.tipo.toUpperCase()}-${Date.now()}`,
      urlDescarga: `${host}/tramites/${tramiteId}/descargar`,
      fechaEmision: new Date(),
    };
  }
}
