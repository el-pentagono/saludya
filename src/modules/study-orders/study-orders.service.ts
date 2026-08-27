import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadoOrdenEstudio } from '../../common/enums/estado-orden-estudio.enum';
import { Rol } from '../../common/enums/rol.enum';
import { NotificationsService } from '../notifications/notifications.service';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { UsuariosService } from '../usuarios/usuarios.service';
import { CreateStudyOrderDto } from './dto/create-study-order.dto';
import { RealizarStudyOrderDto } from './dto/realizar-study-order.dto';
import { StudyOrder } from './entities/study-order.entity';

@Injectable()
export class StudyOrdersService {
  constructor(
    @InjectRepository(StudyOrder)
    private readonly repo: Repository<StudyOrder>,
    private readonly usuariosService: UsuariosService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async crear(medico: Usuario, dto: CreateStudyOrderDto): Promise<StudyOrder> {
    const paciente = await this.usuariosService.findOne(dto.pacienteId);
    if (paciente.rol !== Rol.PACIENTE) {
      throw new BadRequestException('El usuario indicado no es un paciente');
    }

    const fechaSugerida = new Date(dto.fechaSugerida);

    const orden = this.repo.create({
      pacienteId: paciente.id,
      medicoId: medico.id,
      appointmentId: dto.appointmentId ?? null,
      tipoEstudio: dto.tipoEstudio,
      lugar: dto.lugar,
      fechaSugerida,
      indicaciones: dto.indicaciones ?? null,
      estado: EstadoOrdenEstudio.PENDIENTE,
    });

    const guardada = await this.repo.save(orden);

    // Disparo automático de notificación al paciente (punto 2 del circuito)
    const fechaFormateada = fechaSugerida.toLocaleString('es-AR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });

    await this.notificationsService.crear(
      paciente.id,
      'Nueva orden de estudio médico',
      `Tenés una orden para realizarte ${dto.tipoEstudio} en ${dto.lugar} el ${fechaFormateada}.`,
      'estudio_programado',
      {
        studyOrderId: guardada.id,
        tipoEstudio: guardada.tipoEstudio,
        lugar: guardada.lugar,
        fechaSugerida: guardada.fechaSugerida,
      },
    );

    return guardada;
  }

  async marcarRealizado(
    medico: Usuario,
    id: string,
    dto?: RealizarStudyOrderDto,
  ): Promise<StudyOrder> {
    const orden = await this.repo.findOne({
      where: { id },
      relations: ['paciente', 'medico'],
    });

    if (!orden) {
      throw new NotFoundException(`Orden de estudio ${id} no encontrada`);
    }

    if (orden.estado === EstadoOrdenEstudio.CANCELADO) {
      throw new BadRequestException('No se puede marcar como realizada una orden cancelada');
    }

    orden.estado = EstadoOrdenEstudio.REALIZADO;
    orden.fechaRealizado = new Date();

    // Fecha sugerida de control (por defecto a 7 días si no se especifica)
    const fechaControl = dto?.fechaControlSugerida
      ? new Date(dto.fechaControlSugerida)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    orden.fechaControlSugerida = fechaControl;
    const actualizada = await this.repo.save(orden);

    // Disparo automático de notificación al paciente (punto 3 del circuito)
    const fechaControlStr = fechaControl.toLocaleDateString('es-AR');
    await this.notificationsService.crear(
      orden.pacienteId,
      'Estudio médico realizado — Solicitá tu control',
      `Tu estudio de ${orden.tipoEstudio} ya figura como realizado. Se sugiere solicitar turno de control con el médico para el ${fechaControlStr}.`,
      'estudio_realizado_control',
      {
        studyOrderId: actualizada.id,
        fechaControlSugerida: actualizada.fechaControlSugerida,
        tipoEstudio: actualizada.tipoEstudio,
      },
    );

    return actualizada;
  }

  async listar(usuario: Usuario): Promise<StudyOrder[]> {
    if (usuario.rol === Rol.PACIENTE) {
      return this.repo.find({
        where: { pacienteId: usuario.id },
        relations: ['medico', 'appointment'],
        order: { fechaCreacion: 'DESC' },
      });
    }

    if (usuario.rol === Rol.MEDICO) {
      return this.repo.find({
        where: { medicoId: usuario.id },
        relations: ['paciente', 'appointment'],
        order: { fechaCreacion: 'DESC' },
      });
    }

    return this.repo.find({
      relations: ['paciente', 'medico', 'appointment'],
      order: { fechaCreacion: 'DESC' },
    });
  }

  async buscarPorId(id: string, usuario: Usuario): Promise<StudyOrder> {
    const orden = await this.repo.findOne({
      where: { id },
      relations: ['paciente', 'medico', 'appointment'],
    });

    if (!orden) {
      throw new NotFoundException(`Orden de estudio ${id} no encontrada`);
    }

    if (usuario.rol === Rol.PACIENTE && orden.pacienteId !== usuario.id) {
      throw new ForbiddenException('No tenés acceso a esta orden de estudio');
    }

    return orden;
  }
}
