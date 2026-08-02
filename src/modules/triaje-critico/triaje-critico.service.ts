import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppointmentsService } from '../appointments/appointments.service';
import { EstadoTriaje } from '../../common/enums/estado-triaje.enum';
import { Rol } from '../../common/enums/rol.enum';
import { UsuariosService } from '../usuarios/usuarios.service';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { CreateTriajeDto } from './dto/create-triaje.dto';
import { TriajeCritico } from './entities/triaje-critico.entity';

const ROLES_CON_ACCESO_TOTAL = [Rol.ENFERMERO, Rol.MEDICO, Rol.DIRECTOR, Rol.AUDITOR];

@Injectable()
export class TriajeCriticoService {
  constructor(
    @InjectRepository(TriajeCritico)
    private readonly repo: Repository<TriajeCritico>,
    private readonly usuariosService: UsuariosService,
    private readonly appointmentsService: AppointmentsService,
  ) {}

  async crear(evaluador: Usuario, dto: CreateTriajeDto) {
    const paciente = await this.usuariosService.findOne(dto.pacienteId);
    if (paciente.rol !== Rol.PACIENTE) {
      throw new BadRequestException('El usuario indicado no es un paciente');
    }

    const caso = this.repo.create({
      pacienteId: paciente.id,
      evaluadorId: evaluador.id,
      observaciones: dto.observaciones,
      prioridad: dto.prioridad,
      estado: EstadoTriaje.EN_ESPERA,
    });
    return this.repo.save(caso);
  }

  async asignar(medico: Usuario, id: string) {
    const caso = await this.repo.findOne({ where: { id }, relations: ['paciente'] });
    if (!caso) throw new NotFoundException(`Caso de triaje ${id} no encontrado`);
    if (caso.estado !== EstadoTriaje.EN_ESPERA) {
      throw new BadRequestException('El caso no está en espera de asignación');
    }

    const turno = await this.appointmentsService.crear(caso.paciente, {
      medicoId: medico.id,
      fecha: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      motivo: `Triaje crítico (${caso.prioridad})`,
    });

    caso.estado = EstadoTriaje.ASIGNADO;
    caso.medicoAsignadoId = medico.id;
    caso.appointmentId = turno.id;
    caso.fechaAsignacion = new Date();
    return this.repo.save(caso);
  }

  async atender(medico: Usuario, id: string) {
    const caso = await this.repo.findOne({ where: { id } });
    if (!caso) throw new NotFoundException(`Caso de triaje ${id} no encontrado`);
    if (caso.estado !== EstadoTriaje.ASIGNADO) {
      throw new BadRequestException('El caso no está asignado');
    }
    if (caso.medicoAsignadoId !== medico.id) {
      throw new ForbiddenException('Solo el médico asignado puede cerrar el caso');
    }

    caso.estado = EstadoTriaje.ATENDIDO;
    return this.repo.save(caso);
  }

  async cancelar(id: string) {
    const caso = await this.repo.findOne({ where: { id } });
    if (!caso) throw new NotFoundException(`Caso de triaje ${id} no encontrado`);
    if (caso.estado !== EstadoTriaje.EN_ESPERA) {
      throw new BadRequestException('Solo se puede cancelar un caso en espera');
    }

    caso.estado = EstadoTriaje.CANCELADO;
    return this.repo.save(caso);
  }

  async listar(usuario: Usuario) {
    if (usuario.rol === Rol.PACIENTE) {
      return this.repo.find({
        where: { pacienteId: usuario.id },
        relations: ['evaluador', 'medicoAsignado'],
        order: { fechaCreacion: 'DESC' },
      });
    }
    if (ROLES_CON_ACCESO_TOTAL.includes(usuario.rol)) {
      return this.repo.find({
        relations: ['paciente', 'evaluador', 'medicoAsignado'],
        order: { fechaCreacion: 'DESC' },
      });
    }
    return [];
  }

  async buscarPorId(id: string, usuario: Usuario) {
    const caso = await this.repo.findOne({
      where: { id },
      relations: ['paciente', 'evaluador', 'medicoAsignado'],
    });
    if (!caso) throw new NotFoundException(`Caso de triaje ${id} no encontrado`);

    if (usuario.rol === Rol.PACIENTE) {
      if (caso.pacienteId !== usuario.id) {
        throw new ForbiddenException('No tenés acceso a este caso');
      }
      return caso;
    }
    if (ROLES_CON_ACCESO_TOTAL.includes(usuario.rol)) {
      return caso;
    }
    throw new ForbiddenException('No tenés acceso a este caso');
  }
}
