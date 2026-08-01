import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from '../appointments/entities/appointment.entity';
import { MedicalRecord } from '../medical-records/entities/medical-record.entity';
import { Treatment } from '../treatments/entities/treatment.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Usuario) private readonly usuariosRepo: Repository<Usuario>,
    @InjectRepository(Appointment) private readonly appointmentsRepo: Repository<Appointment>,
    @InjectRepository(Treatment) private readonly treatmentsRepo: Repository<Treatment>,
    @InjectRepository(MedicalRecord)
    private readonly medicalRecordsRepo: Repository<MedicalRecord>,
  ) {}

  async resumen() {
    const [usuariosPorRol, turnosPorEstado, tratamientosPorEstado, totalHistoriasClinicas] =
      await Promise.all([
        this.contarPorCampo(this.usuariosRepo, 'usuario', 'rol'),
        this.contarPorCampo(this.appointmentsRepo, 'turno', 'estado'),
        this.contarPorCampo(this.treatmentsRepo, 'tratamiento', 'estado'),
        this.medicalRecordsRepo.count(),
      ]);

    return {
      usuariosPorRol,
      turnosPorEstado,
      tratamientosPorEstado,
      totalHistoriasClinicas,
    };
  }

  private async contarPorCampo<T extends object>(
    repo: Repository<T>,
    alias: string,
    campo: string,
  ): Promise<Record<string, number>> {
    const filas = await repo
      .createQueryBuilder(alias)
      .select(`${alias}.${campo}`, 'clave')
      .addSelect('COUNT(*)', 'cantidad')
      .groupBy(`${alias}.${campo}`)
      .getRawMany<{ clave: string; cantidad: string }>();

    return Object.fromEntries(filas.map((fila) => [fila.clave, Number(fila.cantidad)]));
  }
}
