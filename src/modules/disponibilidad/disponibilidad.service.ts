import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { CreateBloqueDto } from './dto/create-bloque.dto';
import { BloqueDisponibilidad } from './entities/bloque-disponibilidad.entity';

@Injectable()
export class DisponibilidadService {
  constructor(
    @InjectRepository(BloqueDisponibilidad)
    private readonly repo: Repository<BloqueDisponibilidad>,
  ) {}

  async listarPorPaciente(pacienteId: string): Promise<BloqueDisponibilidad[]> {
    return this.repo.find({
      where: { pacienteId },
      order: { diaSemana: 'ASC', horaInicio: 'ASC' },
    });
  }

  async crear(paciente: Usuario, dto: CreateBloqueDto): Promise<BloqueDisponibilidad> {
    if (dto.horaInicio >= dto.horaFin) {
      throw new BadRequestException('La hora de inicio debe ser anterior a la hora de fin');
    }

    const esRecurrente = dto.esRecurrente !== false;
    if (esRecurrente && dto.diaSemana === undefined) {
      throw new BadRequestException('Para un bloque recurrente se debe especificar el día de la semana');
    }
    if (!esRecurrente && !dto.fechaPuntual) {
      throw new BadRequestException('Para un bloque puntual se debe especificar la fecha');
    }

    const bloque = this.repo.create({
      pacienteId: paciente.id,
      titulo: dto.titulo,
      esRecurrente,
      diaSemana: esRecurrente ? dto.diaSemana : null,
      fechaPuntual: !esRecurrente ? dto.fechaPuntual : null,
      horaInicio: dto.horaInicio,
      horaFin: dto.horaFin,
    });

    return this.repo.save(bloque);
  }

  async eliminar(id: string, paciente: Usuario): Promise<{ success: boolean }> {
    const bloque = await this.repo.findOne({ where: { id } });
    if (!bloque) {
      throw new NotFoundException(`Bloque de disponibilidad ${id} no encontrado`);
    }

    if (bloque.pacienteId !== paciente.id) {
      throw new ForbiddenException('No tenés permiso para eliminar este bloque');
    }

    await this.repo.remove(bloque);
    return { success: true };
  }
}
