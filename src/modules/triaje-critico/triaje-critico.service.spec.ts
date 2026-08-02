import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppointmentsService } from '../appointments/appointments.service';
import { EstadoTriaje } from '../../common/enums/estado-triaje.enum';
import { PrioridadTriaje } from '../../common/enums/prioridad-triaje.enum';
import { Rol } from '../../common/enums/rol.enum';
import { UsuariosService } from '../usuarios/usuarios.service';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { TriajeCritico } from './entities/triaje-critico.entity';
import { TriajeCriticoService } from './triaje-critico.service';

const paciente = { id: 'paciente-1', rol: Rol.PACIENTE } as Usuario;
const otroPaciente = { id: 'paciente-2', rol: Rol.PACIENTE } as Usuario;
const enfermero = { id: 'enfermero-1', rol: Rol.ENFERMERO } as Usuario;
const medico = { id: 'medico-1', rol: Rol.MEDICO } as Usuario;
const otroMedico = { id: 'medico-2', rol: Rol.MEDICO } as Usuario;
const director = { id: 'director-1', rol: Rol.DIRECTOR } as Usuario;
const auditor = { id: 'auditor-1', rol: Rol.AUDITOR } as Usuario;
const farmaceutico = { id: 'farmaceutico-1', rol: Rol.FARMACEUTICO } as Usuario;

describe('TriajeCriticoService', () => {
  let service: TriajeCriticoService;
  let repo: { create: jest.Mock; save: jest.Mock; find: jest.Mock; findOne: jest.Mock };
  let usuariosService: { findOne: jest.Mock };
  let appointmentsService: { crear: jest.Mock };

  beforeEach(async () => {
    repo = {
      create: jest.fn((data) => data),
      save: jest.fn((data) => Promise.resolve({ id: 'caso-1', ...data })),
      find: jest.fn(),
      findOne: jest.fn(),
    };
    usuariosService = { findOne: jest.fn() };
    appointmentsService = { crear: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TriajeCriticoService,
        { provide: getRepositoryToken(TriajeCritico), useValue: repo },
        { provide: UsuariosService, useValue: usuariosService },
        { provide: AppointmentsService, useValue: appointmentsService },
      ],
    }).compile();

    service = module.get(TriajeCriticoService);
  });

  describe('crear', () => {
    it('crea el caso en EN_ESPERA cuando el evaluado es un paciente', async () => {
      usuariosService.findOne.mockResolvedValue(paciente);

      const resultado = await service.crear(enfermero, {
        pacienteId: paciente.id,
        observaciones: 'Dolor de pecho, disnea leve',
        prioridad: PrioridadTriaje.ALTA,
      });

      expect(resultado).toMatchObject({
        pacienteId: paciente.id,
        evaluadorId: enfermero.id,
        estado: EstadoTriaje.EN_ESPERA,
        prioridad: PrioridadTriaje.ALTA,
      });
    });

    it('rechaza si el evaluado no tiene rol paciente', async () => {
      usuariosService.findOne.mockResolvedValue(farmaceutico);

      await expect(
        service.crear(medico, {
          pacienteId: farmaceutico.id,
          observaciones: 'x',
          prioridad: PrioridadTriaje.BAJA,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('asignar', () => {
    const casoEnEspera = () =>
      ({
        id: 'caso-1',
        pacienteId: paciente.id,
        paciente,
        estado: EstadoTriaje.EN_ESPERA,
        prioridad: PrioridadTriaje.CRITICA,
      }) as TriajeCritico;

    it('crea el turno vinculado y pasa a ASIGNADO', async () => {
      repo.findOne.mockResolvedValue(casoEnEspera());
      appointmentsService.crear.mockResolvedValue({ id: 'turno-1' });

      const resultado = await service.asignar(medico, 'caso-1');

      expect(appointmentsService.crear).toHaveBeenCalledWith(
        paciente,
        expect.objectContaining({ medicoId: medico.id }),
      );
      expect(resultado).toMatchObject({
        estado: EstadoTriaje.ASIGNADO,
        medicoAsignadoId: medico.id,
        appointmentId: 'turno-1',
      });
    });

    it('rechaza si el caso no está en espera', async () => {
      repo.findOne.mockResolvedValue({ ...casoEnEspera(), estado: EstadoTriaje.ASIGNADO });

      await expect(service.asignar(medico, 'caso-1')).rejects.toThrow(BadRequestException);
      expect(appointmentsService.crear).not.toHaveBeenCalled();
    });

    it('lanza NotFoundException si el caso no existe', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.asignar(medico, 'inexistente')).rejects.toThrow(NotFoundException);
    });
  });

  describe('atender', () => {
    it('permite al médico asignado cerrar el caso', async () => {
      repo.findOne.mockResolvedValue({
        id: 'caso-1',
        estado: EstadoTriaje.ASIGNADO,
        medicoAsignadoId: medico.id,
      } as TriajeCritico);

      const resultado = await service.atender(medico, 'caso-1');

      expect(resultado.estado).toBe(EstadoTriaje.ATENDIDO);
    });

    it('rechaza a un médico distinto del asignado', async () => {
      repo.findOne.mockResolvedValue({
        id: 'caso-1',
        estado: EstadoTriaje.ASIGNADO,
        medicoAsignadoId: medico.id,
      } as TriajeCritico);

      await expect(service.atender(otroMedico, 'caso-1')).rejects.toThrow(ForbiddenException);
    });

    it('rechaza si el caso no está asignado', async () => {
      repo.findOne.mockResolvedValue({
        id: 'caso-1',
        estado: EstadoTriaje.EN_ESPERA,
        medicoAsignadoId: null,
      } as TriajeCritico);

      await expect(service.atender(medico, 'caso-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancelar', () => {
    it('cancela un caso en espera', async () => {
      repo.findOne.mockResolvedValue({ id: 'caso-1', estado: EstadoTriaje.EN_ESPERA } as TriajeCritico);

      const resultado = await service.cancelar('caso-1');

      expect(resultado.estado).toBe(EstadoTriaje.CANCELADO);
    });

    it('rechaza cancelar un caso ya asignado', async () => {
      repo.findOne.mockResolvedValue({ id: 'caso-1', estado: EstadoTriaje.ASIGNADO } as TriajeCritico);

      await expect(service.cancelar('caso-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('listar', () => {
    it('filtra por pacienteId cuando el usuario es paciente', async () => {
      repo.find.mockResolvedValue([]);

      await service.listar(paciente);

      expect(repo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { pacienteId: paciente.id } }),
      );
    });

    it('devuelve todos los casos para enfermero, médico, director y auditor', async () => {
      repo.find.mockResolvedValue([]);

      for (const usuario of [enfermero, medico, director, auditor]) {
        await service.listar(usuario);
      }

      expect(repo.find).toHaveBeenCalledTimes(4);
      for (const call of repo.find.mock.calls) {
        expect(call[0].where).toBeUndefined();
      }
    });

    it('devuelve lista vacía para roles sin relación (farmacéutico)', async () => {
      const resultado = await service.listar(farmaceutico);

      expect(resultado).toEqual([]);
      expect(repo.find).not.toHaveBeenCalled();
    });
  });

  describe('buscarPorId', () => {
    const caso = { id: 'caso-1', pacienteId: paciente.id } as TriajeCritico;

    it('lanza NotFoundException si no existe', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.buscarPorId('inexistente', paciente)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('permite al paciente dueño verlo', async () => {
      repo.findOne.mockResolvedValue(caso);

      await expect(service.buscarPorId(caso.id, paciente)).resolves.toBe(caso);
    });

    it('rechaza a otro paciente', async () => {
      repo.findOne.mockResolvedValue(caso);

      await expect(service.buscarPorId(caso.id, otroPaciente)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('permite a enfermero, médico, director y auditor verlo', async () => {
      repo.findOne.mockResolvedValue(caso);

      for (const usuario of [enfermero, medico, director, auditor]) {
        await expect(service.buscarPorId(caso.id, usuario)).resolves.toBe(caso);
      }
    });

    it('rechaza a roles sin relación (farmacéutico)', async () => {
      repo.findOne.mockResolvedValue(caso);

      await expect(service.buscarPorId(caso.id, farmaceutico)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
