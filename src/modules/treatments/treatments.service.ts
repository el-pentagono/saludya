import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadoTratamiento } from '../../common/enums/estado-tratamiento.enum';
import { Rol } from '../../common/enums/rol.enum';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { UsuariosService } from '../usuarios/usuarios.service';
import { CreateFollowUpDto } from './dto/create-follow-up.dto';
import { CreateTreatmentDto } from './dto/create-treatment.dto';
import { TreatmentFollowUp } from './entities/treatment-follow-up.entity';
import { Treatment } from './entities/treatment.entity';

@Injectable()
export class TreatmentsService {
  constructor(
    @InjectRepository(Treatment)
    private readonly repo: Repository<Treatment>,
    @InjectRepository(TreatmentFollowUp)
    private readonly seguimientosRepo: Repository<TreatmentFollowUp>,
    private readonly usuariosService: UsuariosService,
  ) {}

  async prescribir(medico: Usuario, dto: CreateTreatmentDto) {
    const paciente = await this.usuariosService.findOne(dto.pacienteId);
    if (paciente.rol !== Rol.PACIENTE) {
      throw new BadRequestException('El usuario indicado no es un paciente');
    }

    const tratamiento = this.repo.create({
      pacienteId: paciente.id,
      medicoId: medico.id,
      medicamento: dto.medicamento,
      dosis: dto.dosis,
      indicaciones: dto.indicaciones,
    });
    return this.repo.save(tratamiento);
  }

  async listar(usuario: Usuario) {
    if (usuario.rol === Rol.PACIENTE) {
      return this.repo.find({
        where: { pacienteId: usuario.id },
        relations: ['medico', 'farmaceutico'],
        order: { fechaCreacion: 'DESC' },
      });
    }
    if (usuario.rol === Rol.MEDICO) {
      return this.repo.find({
        where: { medicoId: usuario.id },
        relations: ['paciente', 'farmaceutico'],
        order: { fechaCreacion: 'DESC' },
      });
    }
    // Farmacéutico, enfermero, director y auditor ven todos los tratamientos.
    return this.repo.find({
      relations: ['paciente', 'medico', 'farmaceutico'],
      order: { fechaCreacion: 'DESC' },
    });
  }

  async buscarPorId(id: string, usuario: Usuario) {
    const tratamiento = await this.repo.findOne({
      where: { id },
      relations: ['paciente', 'medico', 'farmaceutico'],
    });
    if (!tratamiento) throw new NotFoundException(`Tratamiento ${id} no encontrado`);

    if (usuario.rol === Rol.PACIENTE && tratamiento.pacienteId !== usuario.id) {
      throw new ForbiddenException('No tenés acceso a este tratamiento');
    }
    return tratamiento;
  }

  async dispensar(farmaceutico: Usuario, id: string) {
    const tratamiento = await this.repo.findOne({ where: { id } });
    if (!tratamiento) throw new NotFoundException(`Tratamiento ${id} no encontrado`);

    if (tratamiento.estado !== EstadoTratamiento.PRESCRITO) {
      throw new BadRequestException('El tratamiento ya fue dispensado');
    }

    tratamiento.estado = EstadoTratamiento.DISPENSADO;
    tratamiento.farmaceuticoId = farmaceutico.id;
    tratamiento.fechaDispensa = new Date();
    return this.repo.save(tratamiento);
  }

  async agregarSeguimiento(enfermero: Usuario, treatmentId: string, dto: CreateFollowUpDto) {
    const tratamiento = await this.repo.findOne({ where: { id: treatmentId } });
    if (!tratamiento) throw new NotFoundException(`Tratamiento ${treatmentId} no encontrado`);

    const seguimiento = this.seguimientosRepo.create({
      treatmentId,
      enfermeroId: enfermero.id,
      nota: dto.nota,
    });
    return this.seguimientosRepo.save(seguimiento);
  }

  async listarSeguimientos(treatmentId: string, usuario: Usuario) {
    await this.buscarPorId(treatmentId, usuario);
    return this.seguimientosRepo.find({
      where: { treatmentId },
      relations: ['enfermero'],
      order: { fecha: 'DESC' },
    });
  }
}
