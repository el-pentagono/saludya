import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppointmentsService } from '../appointments/appointments.service';
import { EstadoTurno } from '../../common/enums/estado-turno.enum';
import { Rol } from '../../common/enums/rol.enum';
import { TipoDocumento } from '../../common/enums/tipo-documento.enum';
import { TreatmentsService } from '../treatments/treatments.service';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Document } from './entities/document.entity';
import {
  TRAMITEXPRESS_CLIENT,
  TramitExpressClient,
} from './tramitexpress/tramitexpress-client.interface';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly repo: Repository<Document>,
    private readonly appointmentsService: AppointmentsService,
    private readonly treatmentsService: TreatmentsService,
    @Inject(TRAMITEXPRESS_CLIENT)
    private readonly tramitExpress: TramitExpressClient,
  ) {}

  async generarConstanciaAtencion(paciente: Usuario, appointmentId: string) {
    const turno = await this.appointmentsService.buscarPorId(appointmentId, paciente);

    if (turno.estado === EstadoTurno.CANCELADO) {
      throw new BadRequestException('No se puede generar una constancia de un turno cancelado');
    }
    if (turno.fecha > new Date()) {
      throw new BadRequestException('El turno todavía no ocurrió');
    }

    const resultado = await this.tramitExpress.generarCertificado({
      tipo: TipoDocumento.CONSTANCIA_ATENCION,
      pacienteId: paciente.id,
      pacienteNombre: `${paciente.nombre} ${paciente.apellido}`,
      contenido: { appointmentId: turno.id, fecha: turno.fecha, medicoId: turno.medicoId },
    });

    const documento = this.repo.create({
      pacienteId: paciente.id,
      tipo: TipoDocumento.CONSTANCIA_ATENCION,
      appointmentId: turno.id,
      tramiteId: resultado.tramiteId,
      numeroConstancia: resultado.numeroConstancia,
      urlDescarga: resultado.urlDescarga,
      fechaEmision: resultado.fechaEmision,
    });
    return this.repo.save(documento);
  }

  async generarCertificadoTratamiento(paciente: Usuario, treatmentId: string) {
    const tratamiento = await this.treatmentsService.buscarPorId(treatmentId, paciente);

    const resultado = await this.tramitExpress.generarCertificado({
      tipo: TipoDocumento.CERTIFICADO_TRATAMIENTO,
      pacienteId: paciente.id,
      pacienteNombre: `${paciente.nombre} ${paciente.apellido}`,
      contenido: {
        treatmentId: tratamiento.id,
        medicamento: tratamiento.medicamento,
        dosis: tratamiento.dosis,
      },
    });

    const documento = this.repo.create({
      pacienteId: paciente.id,
      tipo: TipoDocumento.CERTIFICADO_TRATAMIENTO,
      treatmentId: tratamiento.id,
      tramiteId: resultado.tramiteId,
      numeroConstancia: resultado.numeroConstancia,
      urlDescarga: resultado.urlDescarga,
      fechaEmision: resultado.fechaEmision,
    });
    return this.repo.save(documento);
  }

  async listar(usuario: Usuario) {
    if (usuario.rol === Rol.PACIENTE) {
      return this.repo.find({
        where: { pacienteId: usuario.id },
        order: { fechaEmision: 'DESC' },
      });
    }
    if (usuario.rol === Rol.DIRECTOR || usuario.rol === Rol.AUDITOR) {
      return this.repo.find({ relations: ['paciente'], order: { fechaEmision: 'DESC' } });
    }
    return [];
  }

  async buscarPorId(id: string, usuario: Usuario) {
    const documento = await this.repo.findOne({ where: { id }, relations: ['paciente'] });
    if (!documento) throw new NotFoundException(`Documento ${id} no encontrado`);

    if (usuario.rol === Rol.PACIENTE) {
      if (documento.pacienteId !== usuario.id) {
        throw new ForbiddenException('No tenés acceso a este documento');
      }
      return documento;
    }
    if (usuario.rol === Rol.DIRECTOR || usuario.rol === Rol.AUDITOR) {
      return documento;
    }
    throw new ForbiddenException('No tenés acceso a este documento');
  }
}
