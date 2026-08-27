import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let repo: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    count: jest.Mock;
    update: jest.Mock;
  };

  beforeEach(async () => {
    repo = {
      create: jest.fn((data) => data),
      save: jest.fn((data) => Promise.resolve({ id: 'notif-1', ...data })),
      find: jest.fn(),
      findOne: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: getRepositoryToken(Notification), useValue: repo },
      ],
    }).compile();

    service = module.get(NotificationsService);
  });

  describe('crear', () => {
    it('crea y persiste una notificación para el usuario', async () => {
      const res = await service.crear(
        'user-1',
        'Estudio programado',
        'Tenés un estudio mañana a las 10:00 en Laboratorio Central',
        'estudio_programado',
        { lugar: 'Laboratorio Central' },
      );

      expect(repo.create).toHaveBeenCalledWith({
        usuarioId: 'user-1',
        titulo: 'Estudio programado',
        mensaje: 'Tenés un estudio mañana a las 10:00 en Laboratorio Central',
        tipo: 'estudio_programado',
        metadata: { lugar: 'Laboratorio Central' },
        leida: false,
      });
      expect(res).toHaveProperty('id', 'notif-1');
    });
  });

  describe('listarPorUsuario', () => {
    it('lista todas las notificaciones del usuario ordenadas por fecha', async () => {
      repo.find.mockResolvedValue([{ id: 'notif-1', usuarioId: 'user-1' }]);

      const res = await service.listarPorUsuario('user-1');
      expect(repo.find).toHaveBeenCalledWith({
        where: { usuarioId: 'user-1' },
        order: { fechaCreacion: 'DESC' },
      });
      expect(res).toHaveLength(1);
    });
  });

  describe('marcarLeida', () => {
    it('marca la notificación como leída si existe', async () => {
      repo.findOne.mockResolvedValue({ id: 'notif-1', usuarioId: 'user-1', leida: false });

      const res = await service.marcarLeida('notif-1', 'user-1');
      expect(res.leida).toBe(true);
      expect(repo.save).toHaveBeenCalled();
    });

    it('lanza NotFoundException si la notificación no pertenece al usuario o no existe', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.marcarLeida('notif-99', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('marcarTodasLeidas', () => {
    it('actualiza todas las notificaciones no leídas del usuario', async () => {
      repo.update.mockResolvedValue({ affected: 3 });

      const res = await service.marcarTodasLeidas('user-1');
      expect(repo.update).toHaveBeenCalledWith(
        { usuarioId: 'user-1', leida: false },
        { leida: true },
      );
      expect(res.actualizadas).toBe(3);
    });
  });
});
