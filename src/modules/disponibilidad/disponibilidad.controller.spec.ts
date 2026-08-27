import { Test, TestingModule } from '@nestjs/testing';
import { Rol } from '../../common/enums/rol.enum';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { DisponibilidadController } from './disponibilidad.controller';
import { DisponibilidadService } from './disponibilidad.service';

describe('DisponibilidadController', () => {
  let controller: DisponibilidadController;
  let service: jest.Mocked<DisponibilidadService>;

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
      controllers: [DisponibilidadController],
      providers: [
        {
          provide: DisponibilidadService,
          useValue: {
            listarPorPaciente: jest.fn().mockResolvedValue([]),
            crear: jest.fn().mockResolvedValue({ id: 'bloque-1' }),
            eliminar: jest.fn().mockResolvedValue({ success: true }),
          },
        },
      ],
    }).compile();

    controller = module.get<DisponibilidadController>(DisponibilidadController);
    service = module.get(DisponibilidadService);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('debe llamar a listarPorPaciente con el id del paciente autenticado', async () => {
    await controller.listarMisBloques(mockPaciente);
    expect(service.listarPorPaciente).toHaveBeenCalledWith('paciente-1');
  });

  it('debe llamar a crear con el paciente y el dto', async () => {
    const dto = { titulo: 'Trabajo', horaInicio: '08:00', horaFin: '12:00', diaSemana: 1 };
    await controller.crear(mockPaciente, dto);
    expect(service.crear).toHaveBeenCalledWith(mockPaciente, dto);
  });

  it('debe llamar a eliminar con el id y el paciente', async () => {
    await controller.eliminar('b-1', mockPaciente);
    expect(service.eliminar).toHaveBeenCalledWith('b-1', mockPaciente);
  });
});
