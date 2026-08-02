import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppointmentsService } from '../appointments/appointments.service';
import { Usuario } from '../usuarios/entities/usuario.entity';

@Injectable()
export class TeleconsultService {
  constructor(
    private readonly appointmentsService: AppointmentsService,
    private readonly configService: ConfigService,
  ) {}

  async obtenerSala(appointmentId: string, usuario: Usuario) {
    const turno = await this.appointmentsService.buscarPorId(appointmentId, usuario);

    const proveedor = this.configService.get<string>('VIDEO_PROVIDER', 'jitsi');
    const baseUrl = this.configService.get<string>('VIDEO_BASE_URL', 'https://meet.jit.si');

    return {
      proveedor,
      salaUrl: `${baseUrl}/saludya-${turno.id}`,
    };
  }
}
