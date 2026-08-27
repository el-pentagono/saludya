import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol } from '../../common/enums/rol.enum';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { DisponibilidadService } from './disponibilidad.service';
import { BloqueDisponibilidad } from './entities/bloque-disponibilidad.entity';

describe('DisponibilidadService', () => {
  let service: DisponibilidadService;
  let repo: jest.Mocked<Repository<BloqueDisponibilidad>>;

  const mockPaciente = {
    id: 'paciente-1',
    email: 'paciente@saludya.com.ar',
    nombre: 'Lucas',
    apellido: 'Benítez',
    dni: '38123456',
    password: 'hash',
    rol: Rol.PACIENTE,
    activo: true,
    obraSocialId: null,
    obraSocial: null,
    numeroAfiliado: null,
    fechaRegistro: new Date(),
  } as Usuario;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DisponibilidadService,
        {
          provide: getRepositoryToken(BloqueDisponibilidad),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn((dto) => ({ id: 'bloque-1', ...dto })),
            save: jest.fn((entity) => Promise.resolve(entity)),
            remove: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<DisponibilidadService>(DisponibilidadService);
    repo = module.get(getRepositoryToken(BloqueDisponibilidad));
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  it('debe listar los bloques de un paciente', async () => {
    repo.find.mockResolvedValue([
      {
        id: 'b-1',
        pacienteId: 'paciente-1',
        titulo: 'Trabajo',
        esRecurrente: true,
        diaSemana: 1,
        fechaPuntual: null,
        horaInicio: '09:00',
        horaFin: '12:00',
        fechaCreacion: new Date(),
        paciente: mockPaciente,
      },
    ]);

    const resultado = await service.listarPorPaciente('paciente-1');
    expect(resultado).toHaveLength(1);
    expect(resultado[0].titulo).toBe('Trabajo');
  });

  it('debe crear un bloque de disponibilidad válido', async () => {
    const dto = {
      titulo: 'Facultad',
      esRecurrente: true,
      diaSemana: 3,
      horaInicio: '14:00',
      horaFin: '18:00',
    };

    const resultado = await service.crear(mockPaciente, dto);
    expect(resultado).toBeDefined();
    expect(repo.create).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
  });

  it('debe fallar si la hora de inicio no es anterior a la de fin', async () => {
    await expect(
      service.crear(mockPaciente, {
        titulo: 'Invalido',
        esRecurrente: true,
        diaSemana: 1,
        horaInicio: '15:00',
        horaFin: '14:00',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('debe fallar si es recurrente sin día de la semana', async () => {
    await expect(
      service.crear(mockPaciente, {
        titulo: 'Sin dia',
        esRecurrente: true,
        horaInicio: '10:00',
        horaFin: '12:00',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('debe eliminar un bloque si pertenece al paciente', async () => {
    repo.findOne.mockResolvedValue({
      id: 'b-1',
      pacienteId: 'paciente-1',
    } as BloqueDisponibilidad);

    const res = await service.eliminar('b-1', mockPaciente);
    expect(res.success).toBe(true);
    expect(repo.remove).toHaveBeenCalled();
  });

  it('debe rechazar eliminar si el bloque pertenece a otro paciente', async () => {
    repo.findOne.mockResolvedValue({
      id: 'b-1',
      pacienteId: 'otro-paciente',
    } as BloqueDisponibilidad);

    await expect(service.eliminar('b-1', mockPaciente)).rejects.toThrow(ForbiddenException);
  });

  it('debe fallar si el bloque a eliminar no existe', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.eliminar('inexistente', mockPaciente)).rejects.toThrow(NotFoundException);
  });
});
