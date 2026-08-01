import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppointmentsService } from '../appointments/appointments.service';
import { Rol } from '../../common/enums/rol.enum';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { UsuariosService } from '../usuarios/usuarios.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { MedicalRecord } from './entities/medical-record.entity';

@Injectable()
export class MedicalRecordsService {
  constructor(
    @InjectRepository(MedicalRecord)
    private readonly repo: Repository<MedicalRecord>,
    private readonly usuariosService: UsuariosService,
    private readonly appointmentsService: AppointmentsService,
  ) {}

  async crear(medico: Usuario, dto: CreateMedicalRecordDto) {
    const paciente = await this.usuariosService.findOne(dto.pacienteId);
    if (paciente.rol !== Rol.PACIENTE) {
      throw new BadRequestException('El usuario indicado no es un paciente');
    }

    const entrada = this.repo.create({
      pacienteId: paciente.id,
      medicoId: medico.id,
      diagnostico: dto.diagnostico,
      notas: dto.notas,
    });
    return this.repo.save(entrada);
  }

  async historialDePaciente(pacienteId: string, usuario: Usuario) {
    await this.verificarAccesoAPaciente(pacienteId, usuario);
    return this.repo.find({
      where: { pacienteId },
      relations: ['medico'],
      order: { fecha: 'DESC' },
    });
  }

  async buscarPorId(id: string, usuario: Usuario) {
    const entrada = await this.repo.findOne({
      where: { id },
      relations: ['paciente', 'medico'],
    });
    if (!entrada) throw new NotFoundException(`Entrada clínica ${id} no encontrada`);

    await this.verificarAccesoAPaciente(entrada.pacienteId, usuario);
    return entrada;
  }

  private async verificarAccesoAPaciente(pacienteId: string, usuario: Usuario) {
    if (usuario.rol === Rol.PACIENTE) {
      if (usuario.id !== pacienteId) {
        throw new ForbiddenException('No tenés acceso a esta historia clínica');
      }
      return;
    }
    if (usuario.rol === Rol.DIRECTOR || usuario.rol === Rol.AUDITOR) {
      return;
    }
    if (usuario.rol === Rol.MEDICO) {
      const tieneVinculo = await this.tieneVinculoConPaciente(usuario.id, pacienteId);
      if (!tieneVinculo) {
        throw new ForbiddenException('No tenés un vínculo asistencial con este paciente');
      }
      return;
    }
    throw new ForbiddenException('No tenés acceso a esta historia clínica');
  }

  private async tieneVinculoConPaciente(medicoId: string, pacienteId: string): Promise<boolean> {
    const yaEscribioEntrada = await this.repo.count({ where: { medicoId, pacienteId } });
    if (yaEscribioEntrada > 0) return true;
    return this.appointmentsService.existeVinculo(medicoId, pacienteId);
  }
}
