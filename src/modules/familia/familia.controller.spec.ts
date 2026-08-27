import { Test, TestingModule } from '@nestjs/testing';
import { Rol } from '../../common/enums/rol.enum';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { FamiliaController } from './familia.controller';
import { FamiliaService } from './familia.service';

describe('FamiliaController', () => {
  let controller: FamiliaController;
  let service: jest.Mocked<FamiliaService>;

  const mockTutor = {
    id: 'tutor-1',
    email: 'tutor@saludya.com.ar',
    nombre: 'Lucas',
    apellido: 'Benítez',
    dni: '38123456',
    rol: Rol.PACIENTE,
  } as Usuario;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FamiliaController],
      providers: [
        {
          provide: FamiliaService,
          useValue: {
            obtenerConsentimiento: jest.fn().mockResolvedValue({ id: 'cons-1' }),
            aceptarConsentimiento: jest.fn().mockResolvedValue({ id: 'cons-1' }),
            listarMenores: jest.fn().mockResolvedValue([]),
            obtenerMenor: jest.fn().mockResolvedValue({ id: 'menor-1' }),
            crearMenor: jest.fn().mockResolvedValue({ id: 'menor-1' }),
            actualizarSaludMenor: jest.fn().mockResolvedValue({ id: 'menor-1' }),
            adjuntarDocumento: jest.fn().mockResolvedValue({ id: 'menor-1' }),
            eliminarMenor: jest.fn().mockResolvedValue({ success: true }),
            listarTurnosMenor: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    controller = module.get<FamiliaController>(FamiliaController);
    service = module.get(FamiliaService);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('debe consultar consentimiento', async () => {
    await controller.obtenerConsentimiento(mockTutor);
    expect(service.obtenerConsentimiento).toHaveBeenCalledWith(mockTutor.id);
  });

  it('debe aceptar consentimiento', async () => {
    const dto = { textoAceptado: 'Acepto expresamente' };
    await controller.aceptarConsentimiento(mockTutor, dto);
    expect(service.aceptarConsentimiento).toHaveBeenCalledWith(mockTutor, dto);
  });

  it('debe listar menores', async () => {
    await controller.listarMenores(mockTutor);
    expect(service.listarMenores).toHaveBeenCalledWith(mockTutor.id);
  });

  it('debe crear un menor', async () => {
    const dto = {
      nombre: 'Sofía',
      apellido: 'Benítez',
      dni: '54123987',
      fechaNacimiento: '2019-05-14',
      relacion: 'madre',
    };
    await controller.crearMenor(mockTutor, dto);
    expect(service.crearMenor).toHaveBeenCalledWith(mockTutor, dto);
  });
});
