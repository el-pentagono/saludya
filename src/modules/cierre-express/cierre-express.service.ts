import { Injectable } from '@nestjs/common';
import { AppointmentsService } from '../appointments/appointments.service';
import { DocumentsService } from '../documents/documents.service';
import { MedicalRecordsService } from '../medical-records/medical-records.service';
import { ObrasSocialesService } from '../obras-sociales/obras-sociales.service';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { CierreExpressDto } from './dto/cierre-express.dto';

@Injectable()
export class CierreExpressService {
  constructor(
    private readonly appointmentsService: AppointmentsService,
    private readonly documentsService: DocumentsService,
    private readonly obrasSocialesService: ObrasSocialesService,
    private readonly medicalRecordsService: MedicalRecordsService,
  ) {}

  async cerrarTurno(medico: Usuario, appointmentId: string, dto: CierreExpressDto) {
    const turnoActual = await this.appointmentsService.buscarPorId(appointmentId, medico);

    let obraSocialLiquidacionId: string | null = null;
    if (turnoActual.paciente.obraSocialId) {
      const obraSocial = await this.obrasSocialesService.findOne(
        turnoActual.paciente.obraSocialId,
      );
      obraSocialLiquidacionId = obraSocial.id;
    }

    const turnoCerrado = await this.appointmentsService.cerrar(medico, appointmentId, {
      diagnostico: dto.diagnostico,
      obraSocialLiquidacionId,
    });

    const documento = await this.documentsService.generarConstanciaAtencionParaTurno(turnoCerrado);

    const entradaClinica = await this.medicalRecordsService.crear(medico, {
      pacienteId: turnoCerrado.pacienteId,
      diagnostico: dto.diagnostico,
    });

    return { turno: turnoCerrado, documento, entradaClinica };
  }
}
