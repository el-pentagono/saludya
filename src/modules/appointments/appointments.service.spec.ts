import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EstadoTurno } from '../../common/enums/estado-turno.enum';
import { Rol } from '../../common/enums/rol.enum';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { UsuariosService } from '../usuarios/usuarios.service';
import { AppointmentsService } from './appointments.service';
import { Appointment } from './entities/appointment.entity';

const paciente = { id: 'paciente-1', rol: Rol.PACIENTE } as Usuario;
const otroPaciente = { id: 'paciente-2', rol: Rol.PACIENTE } as Usuario;
const medico = { id: 'medico-1', rol: Rol.MEDICO } as Usuario;
const director = { id: 'director-1', rol: Rol.DIRECTOR } as Usuario;
const auditor = { id: 'auditor-1', rol: Rol.AUDITOR } as Usuario;
const enfermero = { id: 'enfermero-1', rol: Rol.ENFERMERO } as Usuario;

const fechaFutura = () => new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  let repo: { create: jest.Mock; save: jest.Mock; findOne: jest.Mock; createQueryBuilder: jest.Mock };
  let usuariosService: { findOne: jest.Mock };
  let queryBuilder: {
    leftJoinAndSelect: jest.Mock;
    orderBy: jest.Mock;
    where: jest.Mock;
    getMany: jest.Mock;
  };

  beforeEach(async () => {
    queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    };

    repo = {
      create: jest.fn((data) => data),
      save: jest.fn((data) => Promise.resolve({ id: 'turno-1', ...data })),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(() => queryBuilder),
    };

    usuariosService = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        { provide: getRepositoryToken(Appointment), useValue: repo },
        { provide: UsuariosService, useValue: usuariosService },
      ],
    }).compile();

    service = module.get(AppointmentsService);
  });

  describe('crear', () => {
    it('crea un turno cuando el profesional es médico y la fecha es futura', async () => {
      usuariosService.findOne.mockResolvedValue(medico);

      const resultado = await service.crear(paciente, {
        medicoId: medico.id,
        fecha: fechaFutura(),
      });

      expect(usuariosService.findOne).toHaveBeenCalledWith(medico.id);
      expect(repo.save).toHaveBeenCalled();
      expect(resultado).toMatchObject({ pacienteId: paciente.id, medicoId: medico.id });
    });

    it('rechaza si el profesional indicado no tiene rol médico', async () => {
      usuariosService.findOne.mockResolvedValue(enfermero);

      await expect(
        service.crear(paciente, { medicoId: enfermero.id, fecha: fechaFutura() }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rechaza si la fecha del turno no es futura', async () => {
      usuariosService.findOne.mockResolvedValue(medico);

      await expect(
        service.crear(paciente, {
          medicoId: medico.id,
          fecha: new Date(Date.now() - 1000).toISOString(),
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('listar', () => {
    it('filtra por pacienteId cuando el usuario es paciente', async () => {
      queryBuilder.getMany.mockResolvedValue([]);

      await service.listar(paciente);

      expect(queryBuilder.where).toHaveBeenCalledWith('turno.pacienteId = :id', {
        id: paciente.id,
      });
    });

    it('filtra por medicoId cuando el usuario es médico', async () => {
      queryBuilder.getMany.mockResolvedValue([]);

      await service.listar(medico);

      expect(queryBuilder.where).toHaveBeenCalledWith('turno.medicoId = :id', {
        id: medico.id,
      });
    });

    it('no filtra (ve todo) cuando el usuario es director o auditor', async () => {
      queryBuilder.getMany.mockResolvedValue([]);

      await service.listar(director);
      await service.listar(auditor);

      expect(queryBuilder.where).not.toHaveBeenCalled();
    });

    it('devuelve lista vacía para roles sin relación con turnos', async () => {
      const resultado = await service.listar(enfermero);

      expect(resultado).toEqual([]);
      expect(queryBuilder.getMany).not.toHaveBeenCalled();
    });
  });

  describe('buscarPorId', () => {
    const turno = {
      id: 'turno-1',
      pacienteId: paciente.id,
      medicoId: medico.id,
      estado: EstadoTurno.PENDIENTE,
    } as Appointment;

    it('lanza NotFoundException si el turno no existe', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.buscarPorId('inexistente', paciente)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('permite ver el turno a las partes involucradas', async () => {
      repo.findOne.mockResolvedValue(turno);

      await expect(service.buscarPorId(turno.id, paciente)).resolves.toBe(turno);
      await expect(service.buscarPorId(turno.id, medico)).resolves.toBe(turno);
    });

    it('permite ver el turno a director y auditor', async () => {
      repo.findOne.mockResolvedValue(turno);

      await expect(service.buscarPorId(turno.id, director)).resolves.toBe(turno);
      await expect(service.buscarPorId(turno.id, auditor)).resolves.toBe(turno);
    });

    it('rechaza el acceso a terceros sin relación con el turno', async () => {
      repo.findOne.mockResolvedValue(turno);

      await expect(service.buscarPorId(turno.id, otroPaciente)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('cancelar', () => {
    const turnoPendiente = () =>
      ({
        id: 'turno-1',
        pacienteId: paciente.id,
        medicoId: medico.id,
        estado: EstadoTurno.PENDIENTE,
      }) as Appointment;

    it('permite al paciente cancelar su propio turno', async () => {
      const turno = turnoPendiente();
      repo.findOne.mockResolvedValue(turno);

      const resultado = await service.cancelar(turno.id, paciente);

      expect(resultado.estado).toBe(EstadoTurno.CANCELADO);
      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({ estado: EstadoTurno.CANCELADO }),
      );
    });

    it('permite al médico cancelar un turno de su agenda', async () => {
      repo.findOne.mockResolvedValue(turnoPendiente());

      const resultado = await service.cancelar('turno-1', medico);

      expect(resultado.estado).toBe(EstadoTurno.CANCELADO);
    });

    it('permite al director cancelar cualquier turno', async () => {
      repo.findOne.mockResolvedValue(turnoPendiente());

      const resultado = await service.cancelar('turno-1', director);

      expect(resultado.estado).toBe(EstadoTurno.CANCELADO);
    });

    it('rechaza la cancelación de un auditor (solo lectura)', async () => {
      repo.findOne.mockResolvedValue(turnoPendiente());

      await expect(service.cancelar('turno-1', auditor)).rejects.toThrow(ForbiddenException);
    });

    it('rechaza cancelar un turno ya cancelado', async () => {
      repo.findOne.mockResolvedValue({ ...turnoPendiente(), estado: EstadoTurno.CANCELADO });

      await expect(service.cancelar('turno-1', paciente)).rejects.toThrow(BadRequestException);
    });

    it('lanza NotFoundException si el turno no existe', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.cancelar('inexistente', paciente)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
