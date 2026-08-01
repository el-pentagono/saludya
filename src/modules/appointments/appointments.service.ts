import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadoTurno } from '../../common/enums/estado-turno.enum';
import { Rol } from '../../common/enums/rol.enum';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { UsuariosService } from '../usuarios/usuarios.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Appointment } from './entities/appointment.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly repo: Repository<Appointment>,
    private readonly usuariosService: UsuariosService,
  ) {}

  async crear(paciente: Usuario, dto: CreateAppointmentDto) {
    const medico = await this.usuariosService.findOne(dto.medicoId);
    if (medico.rol !== Rol.MEDICO) {
      throw new BadRequestException('El profesional indicado no es un médico');
    }

    const fecha = new Date(dto.fecha);
    if (fecha.getTime() <= Date.now()) {
      throw new BadRequestException('La fecha del turno debe ser futura');
    }

    const turno = this.repo.create({
      pacienteId: paciente.id,
      medicoId: medico.id,
      fecha,
      motivo: dto.motivo,
    });
    return this.repo.save(turno);
  }

  async listar(usuario: Usuario) {
    const query = this.repo
      .createQueryBuilder('turno')
      .leftJoinAndSelect('turno.paciente', 'paciente')
      .leftJoinAndSelect('turno.medico', 'medico')
      .orderBy('turno.fecha', 'DESC');

    if (usuario.rol === Rol.PACIENTE) {
      query.where('turno.pacienteId = :id', { id: usuario.id });
    } else if (usuario.rol === Rol.MEDICO) {
      query.where('turno.medicoId = :id', { id: usuario.id });
    } else if (usuario.rol !== Rol.DIRECTOR && usuario.rol !== Rol.AUDITOR) {
      return [];
    }

    return query.getMany();
  }

  async buscarPorId(id: string, usuario: Usuario) {
    const turno = await this.repo.findOne({
      where: { id },
      relations: ['paciente', 'medico'],
    });
    if (!turno) throw new NotFoundException(`Turno ${id} no encontrado`);

    const esParte = turno.pacienteId === usuario.id || turno.medicoId === usuario.id;
    const esSupervisor = usuario.rol === Rol.DIRECTOR || usuario.rol === Rol.AUDITOR;
    if (!esParte && !esSupervisor) {
      throw new ForbiddenException('No tenés acceso a este turno');
    }

    return turno;
  }

  async cancelar(id: string, usuario: Usuario) {
    const turno = await this.repo.findOne({
      where: { id },
      relations: ['paciente', 'medico'],
    });
    if (!turno) throw new NotFoundException(`Turno ${id} no encontrado`);

    const esParte = turno.pacienteId === usuario.id || turno.medicoId === usuario.id;
    if (!esParte && usuario.rol !== Rol.DIRECTOR) {
      throw new ForbiddenException('No podés cancelar este turno');
    }
    if (turno.estado === EstadoTurno.CANCELADO) {
      throw new BadRequestException('El turno ya está cancelado');
    }

    turno.estado = EstadoTurno.CANCELADO;
    return this.repo.save(turno);
  }
}
