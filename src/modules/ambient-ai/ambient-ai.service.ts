import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppointmentsService } from '../appointments/appointments.service';
import { Rol } from '../../common/enums/rol.enum';
import { MedicalRecordsService } from '../medical-records/medical-records.service';
import { Usuario } from '../usuarios/entities/usuario.entity';
import {
  AMBIENT_AI_CLIENT,
  AmbientAiClient,
} from './ambient-ai-client/ambient-ai-client.interface';
import { ConfirmarTranscripcionDto } from './dto/confirmar-transcripcion.dto';
import { CreateTranscripcionDto } from './dto/create-transcripcion.dto';
import { TranscripcionConsulta } from './entities/transcripcion-consulta.entity';

@Injectable()
export class AmbientAiService {
  constructor(
    @InjectRepository(TranscripcionConsulta)
    private readonly repo: Repository<TranscripcionConsulta>,
    private readonly appointmentsService: AppointmentsService,
    private readonly medicalRecordsService: MedicalRecordsService,
    @Inject(AMBIENT_AI_CLIENT)
    private readonly ambientAi: AmbientAiClient,
  ) {}

  async crear(medico: Usuario, dto: CreateTranscripcionDto) {
    const turno = await this.appointmentsService.buscarPorId(dto.appointmentId, medico);

    const yaExiste = await this.repo.findOne({ where: { appointmentId: turno.id } });
    if (yaExiste) {
      throw new ConflictException('Ya existe una transcripción para este turno');
    }

    const resultado = await this.ambientAi.generarResumen({
      transcripcionCruda: dto.transcripcionCruda,
      contexto: {
        pacienteNombre: `${turno.paciente?.nombre ?? ''} ${turno.paciente?.apellido ?? ''}`.trim(),
        medicoNombre: `${medico.nombre} ${medico.apellido}`,
        motivo: turno.motivo,
      },
    });

    const transcripcion = this.repo.create({
      appointmentId: turno.id,
      medicoId: medico.id,
      pacienteId: turno.pacienteId,
      transcripcionCruda: resultado.transcripcionCruda,
      resumen: resultado.resumen,
      puntosClave: resultado.puntosClave,
    });
    return this.repo.save(transcripcion);
  }

  async confirmar(medico: Usuario, id: string, dto: ConfirmarTranscripcionDto) {
    const transcripcion = await this.repo.findOne({ where: { id } });
    if (!transcripcion) throw new NotFoundException(`Transcripción ${id} no encontrada`);

    if (transcripcion.medicoId !== medico.id) {
      throw new ForbiddenException('Solo el médico del turno puede confirmar esta transcripción');
    }
    if (transcripcion.medicalRecordId) {
      throw new BadRequestException('Esta transcripción ya fue confirmada');
    }

    const entrada = await this.medicalRecordsService.crear(medico, {
      pacienteId: transcripcion.pacienteId,
      diagnostico: dto.diagnostico,
      notas: dto.notasFinales ?? transcripcion.resumen,
    });

    transcripcion.medicalRecordId = entrada.id;
    transcripcion.fechaConfirmacion = new Date();
    return this.repo.save(transcripcion);
  }

  async listar(usuario: Usuario) {
    if (usuario.rol === Rol.MEDICO) {
      return this.repo.find({
        where: { medicoId: usuario.id },
        relations: ['paciente'],
        order: { fechaCreacion: 'DESC' },
      });
    }
    if (usuario.rol === Rol.DIRECTOR || usuario.rol === Rol.AUDITOR) {
      return this.repo.find({
        relations: ['paciente', 'medico'],
        order: { fechaCreacion: 'DESC' },
      });
    }
    return [];
  }

  async buscarPorId(id: string, usuario: Usuario) {
    const transcripcion = await this.repo.findOne({
      where: { id },
      relations: ['paciente', 'medico'],
    });
    if (!transcripcion) throw new NotFoundException(`Transcripción ${id} no encontrada`);

    if (usuario.rol === Rol.MEDICO) {
      if (transcripcion.medicoId !== usuario.id) {
        throw new ForbiddenException('No tenés acceso a esta transcripción');
      }
      return transcripcion;
    }
    if (usuario.rol === Rol.DIRECTOR || usuario.rol === Rol.AUDITOR) {
      return transcripcion;
    }
    throw new ForbiddenException('No tenés acceso a esta transcripción');
  }
}
