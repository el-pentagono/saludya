import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Appointment } from '../appointments/entities/appointment.entity';
import { MedicalRecord } from '../medical-records/entities/medical-record.entity';
import { Treatment } from '../treatments/entities/treatment.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { AdminService } from './admin.service';

const crearQueryBuilderMock = (filas: Array<{ clave: string; cantidad: string }>) => {
  const queryBuilder = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockResolvedValue(filas),
  };
  return queryBuilder;
};

describe('AdminService', () => {
  let service: AdminService;
  let usuariosRepo: { createQueryBuilder: jest.Mock };
  let appointmentsRepo: { createQueryBuilder: jest.Mock };
  let treatmentsRepo: { createQueryBuilder: jest.Mock };
  let medicalRecordsRepo: { count: jest.Mock };

  beforeEach(async () => {
    usuariosRepo = {
      createQueryBuilder: jest.fn(() =>
        crearQueryBuilderMock([
          { clave: 'paciente', cantidad: '10' },
          { clave: 'medico', cantidad: '3' },
        ]),
      ),
    };
    appointmentsRepo = {
      createQueryBuilder: jest.fn(() =>
        crearQueryBuilderMock([
          { clave: 'pendiente', cantidad: '5' },
          { clave: 'cancelado', cantidad: '2' },
        ]),
      ),
    };
    treatmentsRepo = {
      createQueryBuilder: jest.fn(() =>
        crearQueryBuilderMock([
          { clave: 'prescrito', cantidad: '4' },
          { clave: 'dispensado', cantidad: '1' },
        ]),
      ),
    };
    medicalRecordsRepo = { count: jest.fn().mockResolvedValue(7) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: getRepositoryToken(Usuario), useValue: usuariosRepo },
        { provide: getRepositoryToken(Appointment), useValue: appointmentsRepo },
        { provide: getRepositoryToken(Treatment), useValue: treatmentsRepo },
        { provide: getRepositoryToken(MedicalRecord), useValue: medicalRecordsRepo },
      ],
    }).compile();

    service = module.get(AdminService);
  });

  it('arma el resumen agregando usuarios, turnos, tratamientos e historias clínicas', async () => {
    const resultado = await service.resumen();

    expect(resultado).toEqual({
      usuariosPorRol: { paciente: 10, medico: 3 },
      turnosPorEstado: { pendiente: 5, cancelado: 2 },
      tratamientosPorEstado: { prescrito: 4, dispensado: 1 },
      totalHistoriasClinicas: 7,
    });
  });
});
