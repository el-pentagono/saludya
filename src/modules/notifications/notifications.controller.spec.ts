import { Test, TestingModule } from '@nestjs/testing';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

const mockUser = { id: 'user-1', nombre: 'Juan', apellido: 'Pérez' } as Usuario;

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let service: {
    listarPorUsuario: jest.Mock;
    contarNoLeidas: jest.Mock;
    marcarLeida: jest.Mock;
    marcarTodasLeidas: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      listarPorUsuario: jest.fn().mockResolvedValue([]),
      contarNoLeidas: jest.fn().mockResolvedValue(0),
      marcarLeida: jest.fn().mockResolvedValue({ id: 'notif-1', leida: true }),
      marcarTodasLeidas: jest.fn().mockResolvedValue({ actualizadas: 2 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [{ provide: NotificationsService, useValue: service }],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
  });

  it('lista notificaciones del usuario actual', async () => {
    await controller.listar(mockUser);
    expect(service.listarPorUsuario).toHaveBeenCalledWith(mockUser.id);
  });

  it('cuenta notificaciones no leídas del usuario', async () => {
    await controller.contarNoLeidas(mockUser);
    expect(service.contarNoLeidas).toHaveBeenCalledWith(mockUser.id);
  });

  it('marca una notificación como leída', async () => {
    await controller.marcarLeida('notif-1', mockUser);
    expect(service.marcarLeida).toHaveBeenCalledWith('notif-1', mockUser.id);
  });

  it('marca todas como leídas', async () => {
    await controller.marcarTodasLeidas(mockUser);
    expect(service.marcarTodasLeidas).toHaveBeenCalledWith(mockUser.id);
  });
});
