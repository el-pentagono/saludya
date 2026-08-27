import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EstadoOrdenEstudio } from '../../common/enums/estado-orden-estudio.enum';
import { Rol } from '../../common/enums/rol.enum';
import { NotificationsService } from '../notifications/notifications.service';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { UsuariosService } from '../usuarios/usuarios.service';
import { StudyOrder } from './entities/study-order.entity';
import { StudyOrdersService } from './study-orders.service';

const paciente = { id: 'paciente-1', rol: Rol.PACIENTE } as Usuario;
const otroPaciente = { id: 'paciente-2', rol: Rol.PACIENTE } as Usuario;
const medico = { id: 'medico-1', rol: Rol.MEDICO } as Usuario;
const enfermero = { id: 'enfermero-1', rol: Rol.ENFERMERO } as Usuario;

describe('StudyOrdersService', () => {
  let service: StudyOrdersService;
  let repo: { create: jest.Mock; save: jest.Mock; find: jest.Mock; findOne: jest.Mock };
  let usuariosService: { findOne: jest.Mock };
  let notificationsService: { crear: jest.Mock };

  beforeEach(async () => {
    repo = {
      create: jest.fn((data) => data),
      save: jest.fn((data) => Promise.resolve({ id: 'order-1', ...data })),
      find: jest.fn(),
      findOne: jest.fn(),
    };

    usuariosService = { findOne: jest.fn() };
    notificationsService = { crear: jest.fn().mockResolvedValue({}) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudyOrdersService,
        { provide: getRepositoryToken(StudyOrder), useValue: repo },
        { provide: UsuariosService, useValue: usuariosService },
        { provide: NotificationsService, useValue: notificationsService },
      ],
    }).compile();

    service = module.get(StudyOrdersService);
  });

  describe('crear', () => {
    it('crea una orden de estudio y emite notificación automática al paciente', async () => {
      usuariosService.findOne.mockResolvedValue(paciente);

      const dto = {
        pacienteId: paciente.id,
        tipoEstudio: 'Laboratorio de sangre',
        lugar: 'Hospital Central de San Fernando',
        fechaSugerida: '2026-08-30T09:00:00.000Z',
      };

      const res = await service.crear(medico, dto);

      expect(usuariosService.findOne).toHaveBeenCalledWith(paciente.id);
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          pacienteId: paciente.id,
          medicoId: medico.id,
          tipoEstudio: 'Laboratorio de sangre',
          lugar: 'Hospital Central de San Fernando',
          estado: EstadoOrdenEstudio.PENDIENTE,
        }),
      );
      expect(repo.save).toHaveBeenCalled();
      expect(notificationsService.crear).toHaveBeenCalledWith(
        paciente.id,
        'Nueva orden de estudio médico',
        expect.stringContaining('Laboratorio de sangre'),
        'estudio_programado',
        expect.objectContaining({
          studyOrderId: 'order-1',
          tipoEstudio: 'Laboratorio de sangre',
          lugar: 'Hospital Central de San Fernando',
        }),
      );
      expect(res).toHaveProperty('id', 'order-1');
    });

    it('rechaza si el destinatario no es un paciente', async () => {
      usuariosService.findOne.mockResolvedValue(enfermero);

      await expect(
        service.crear(medico, {
          pacienteId: enfermero.id,
          tipoEstudio: 'Rayos X',
          lugar: 'Hospital',
          fechaSugerida: '2026-08-30T09:00:00.000Z',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('marcarRealizado', () => {
    it('marca la orden como realizada y dispara notificación con fecha de control', async () => {
      const ordenExistente = {
        id: 'order-1',
        pacienteId: paciente.id,
        medicoId: medico.id,
        tipoEstudio: 'Laboratorio de sangre',
        estado: EstadoOrdenEstudio.PENDIENTE,
      } as StudyOrder;

      repo.findOne.mockResolvedValue(ordenExistente);

      const res = await service.marcarRealizado(medico, 'order-1', {
        fechaControlSugerida: '2026-09-05T10:00:00.000Z',
      });

      expect(res.estado).toBe(EstadoOrdenEstudio.REALIZADO);
      expect(res.fechaRealizado).toBeDefined();
      expect(res.fechaControlSugerida).toBeDefined();
      expect(notificationsService.crear).toHaveBeenCalledWith(
        paciente.id,
        'Estudio médico realizado — Solicitá tu control',
        expect.stringContaining('Laboratorio de sangre'),
        'estudio_realizado_control',
        expect.any(Object),
      );
    });

    it('lanza NotFoundException si la orden no existe', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.marcarRealizado(medico, 'order-99')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('rechaza marcar como realizada una orden cancelada', async () => {
      repo.findOne.mockResolvedValue({
        id: 'order-1',
        estado: EstadoOrdenEstudio.CANCELADO,
      });

      await expect(service.marcarRealizado(medico, 'order-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('buscarPorId', () => {
    it('permite al paciente ver su propia orden', async () => {
      const orden = { id: 'order-1', pacienteId: paciente.id } as StudyOrder;
      repo.findOne.mockResolvedValue(orden);

      await expect(service.buscarPorId('order-1', paciente)).resolves.toBe(orden);
    });

    it('prohíbe a otro paciente ver la orden', async () => {
      const orden = { id: 'order-1', pacienteId: paciente.id } as StudyOrder;
      repo.findOne.mockResolvedValue(orden);

      await expect(service.buscarPorId('order-1', otroPaciente)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
