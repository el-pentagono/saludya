import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadoTratamiento } from '../../common/enums/estado-tratamiento.enum';
import { Rol } from '../../common/enums/rol.enum';
import { NotificationsService } from '../notifications/notifications.service';
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
    private readonly notificationsService: NotificationsService,
  ) {}

  async prescribir(medico: Usuario, dto: CreateTreatmentDto) {
    const paciente = await this.usuariosService.findOne(dto.pacienteId);
    if (paciente.rol !== Rol.PACIENTE) {
      throw new BadRequestException('El usuario indicado no es un paciente');
    }

    const tratamiento = this.repo.create({
      pacienteId: paciente.id,
      medicoId: medico.id,
      appointmentId: dto.appointmentId ?? null,
      medicamento: dto.medicamento,
      dosis: dto.dosis,
      cantidad: dto.cantidad ?? '1 unidad',
      esGratuita: dto.esGratuita ?? true,
      indicaciones: dto.indicaciones,
    });
    const guardado = await this.repo.save(tratamiento);

    // Disparo automático de notificación al paciente (punto 5 del circuito)
    const nombreMedico = medico.nombre ? `Dr/a. ${medico.nombre} ${medico.apellido ?? ''}`.trim() : 'El médico';
    const tagGratuita = guardado.esGratuita ? ' [Gratuita / Hospital]' : '';
    await this.notificationsService.crear(
      paciente.id,
      'Nueva receta digital emitida',
      `${nombreMedico} te prescribió ${guardado.medicamento} (${guardado.dosis}, ${guardado.cantidad})${tagGratuita}. Ya podés pasar a retirarla por Farmacia.`,
      'receta_emitida',
      {
        treatmentId: guardado.id,
        medicamento: guardado.medicamento,
        cantidad: guardado.cantidad,
        esGratuita: guardado.esGratuita,
      },
    );

    return guardado;
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
    const guardado = await this.repo.save(tratamiento);

    // Disparo automático de notificación al paciente (punto 7 del circuito)
    await this.notificationsService.crear(
      tratamiento.pacienteId,
      'Receta entregada en farmacia',
      `Tu receta de ${tratamiento.medicamento} (${tratamiento.dosis}, ${tratamiento.cantidad}) fue entregada exitosamente en farmacia.`,
      'receta_entregada',
      {
        treatmentId: guardado.id,
        medicamento: guardado.medicamento,
        fechaDispensa: guardado.fechaDispensa,
      },
    );

    return guardado;
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
