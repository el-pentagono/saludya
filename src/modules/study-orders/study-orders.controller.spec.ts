import { Test, TestingModule } from '@nestjs/testing';
import { Rol } from '../../common/enums/rol.enum';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { StudyOrdersController } from './study-orders.controller';
import { StudyOrdersService } from './study-orders.service';

const mockMedico = { id: 'medico-1', rol: Rol.MEDICO } as Usuario;

describe('StudyOrdersController', () => {
  let controller: StudyOrdersController;
  let service: {
    crear: jest.Mock;
    listar: jest.Mock;
    buscarPorId: jest.Mock;
    marcarRealizado: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      crear: jest.fn().mockResolvedValue({ id: 'order-1' }),
      listar: jest.fn().mockResolvedValue([]),
      buscarPorId: jest.fn().mockResolvedValue({ id: 'order-1' }),
      marcarRealizado: jest.fn().mockResolvedValue({ id: 'order-1', estado: 'realizado' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudyOrdersController],
      providers: [{ provide: StudyOrdersService, useValue: service }],
    }).compile();

    controller = module.get<StudyOrdersController>(StudyOrdersController);
  });

  it('crea una orden de estudio', async () => {
    const dto = {
      pacienteId: 'paciente-1',
      tipoEstudio: 'Ecografía',
      lugar: 'Hospital',
      fechaSugerida: '2026-09-01T10:00:00.000Z',
    };
    const res = await controller.crear(mockMedico, dto);
    expect(service.crear).toHaveBeenCalledWith(mockMedico, dto);
    expect(res).toHaveProperty('id', 'order-1');
  });

  it('lista órdenes de estudio', async () => {
    await controller.listar(mockMedico);
    expect(service.listar).toHaveBeenCalledWith(mockMedico);
  });

  it('busca una orden por ID', async () => {
    await controller.buscarPorId('order-1', mockMedico);
    expect(service.buscarPorId).toHaveBeenCalledWith('order-1', mockMedico);
  });

  it('marca una orden como realizada', async () => {
    const dto = { fechaControlSugerida: '2026-09-08T10:00:00.000Z' };
    await controller.marcarRealizado('order-1', mockMedico, dto);
    expect(service.marcarRealizado).toHaveBeenCalledWith(mockMedico, 'order-1', dto);
  });
});
