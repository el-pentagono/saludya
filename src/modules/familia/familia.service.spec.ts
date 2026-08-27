import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol } from '../../common/enums/rol.enum';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { ConsentimientoMenor } from './entities/consentimiento-menor.entity';
import { MenorACargo } from './entities/menor-a-cargo.entity';
import { FamiliaService } from './familia.service';

describe('FamiliaService', () => {
  let service: FamiliaService;
  let consentimientoRepo: jest.Mocked<Repository<ConsentimientoMenor>>;
  let menorRepo: jest.Mocked<Repository<MenorACargo>>;
  let appointmentsRepo: jest.Mocked<Repository<Appointment>>;

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
      providers: [
        FamiliaService,
        {
          provide: getRepositoryToken(ConsentimientoMenor),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn((dto) => ({ id: 'cons-1', ...dto })),
            save: jest.fn((entity) => Promise.resolve(entity)),
          },
        },
        {
          provide: getRepositoryToken(MenorACargo),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn((dto) => ({ id: 'menor-1', ...dto })),
            save: jest.fn((entity) => Promise.resolve(entity)),
            remove: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: getRepositoryToken(Appointment),
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FamiliaService>(FamiliaService);
    consentimientoRepo = module.get(getRepositoryToken(ConsentimientoMenor));
    menorRepo = module.get(getRepositoryToken(MenorACargo));
    appointmentsRepo = module.get(getRepositoryToken(Appointment));
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('consentimiento', () => {
    it('debe registrar el consentimiento informado del tutor', async () => {
      const res = await service.aceptarConsentimiento(mockTutor, {
        textoAceptado: 'Acepto expresamente el tratamiento de datos del menor',
      });
      expect(res).toBeDefined();
      expect(consentimientoRepo.save).toHaveBeenCalled();
    });

    it('debe obtener el consentimiento del tutor', async () => {
      consentimientoRepo.findOne.mockResolvedValue({
        id: 'cons-1',
        tutorId: mockTutor.id,
        versionPolitica: '1.0',
        textoAceptado: 'Texto legal',
        ipAddress: null,
        fechaAceptacion: new Date(),
        tutor: mockTutor,
      });

      const res = await service.obtenerConsentimiento(mockTutor.id);
      expect(res).toBeDefined();
      expect(res?.id).toBe('cons-1');
    });
  });

  describe('crearMenor', () => {
    it('debe rechazar la creación si el tutor NO aceptó el consentimiento', async () => {
      consentimientoRepo.findOne.mockResolvedValue(null);

      await expect(
        service.crearMenor(mockTutor, {
          nombre: 'Sofía',
          apellido: 'Benítez',
          dni: '54123987',
          fechaNacimiento: '2019-05-14',
          relacion: 'madre',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('debe rechazar la creación si el menor tiene 16 años o más', async () => {
      consentimientoRepo.findOne.mockResolvedValue({ id: 'c-1' } as ConsentimientoMenor);

      await expect(
        service.crearMenor(mockTutor, {
          nombre: 'Juan',
          apellido: 'Benítez',
          dni: '48123987',
          fechaNacimiento: '2005-01-01', // > 16 años
          relacion: 'padre',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe rechazar fecha de nacimiento futura', async () => {
      consentimientoRepo.findOne.mockResolvedValue({ id: 'c-1' } as ConsentimientoMenor);

      await expect(
        service.crearMenor(mockTutor, {
          nombre: 'Bebé',
          apellido: 'Benítez',
          dni: '59123987',
          fechaNacimiento: '2030-01-01',
          relacion: 'madre',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe crear el perfil del menor si cumple todas las condiciones', async () => {
      consentimientoRepo.findOne.mockResolvedValue({ id: 'c-1' } as ConsentimientoMenor);

      const res = await service.crearMenor(mockTutor, {
        nombre: 'Sofía',
        apellido: 'Benítez',
        dni: '54123987',
        fechaNacimiento: '2019-05-14',
        relacion: 'padre',
        grupoSanguineo: '0+',
      });

      expect(res).toBeDefined();
      expect(res.estadoVerificacion).toBe('declarado');
      expect(menorRepo.save).toHaveBeenCalled();
    });

    it('debe marcar estadoVerificacion como documentado si incluye documento de respaldo', async () => {
      consentimientoRepo.findOne.mockResolvedValue({ id: 'c-1' } as ConsentimientoMenor);

      const res = await service.crearMenor(mockTutor, {
        nombre: 'Sofía',
        apellido: 'Benítez',
        dni: '54123987',
        fechaNacimiento: '2019-05-14',
        relacion: 'padre',
        documentoRespaldoUrl: 'data:image/png;base64,sample',
        documentoRespaldoNombre: 'dni-sofia.png',
        documentoRespaldoTipo: 'dni',
      });

      expect(res).toBeDefined();
      expect(res.estadoVerificacion).toBe('documentado');
    });
  });

  describe('gestión de menor existente', () => {
    it('debe obtener el menor si pertenece al tutor', async () => {
      menorRepo.findOne.mockResolvedValue({
        id: 'menor-1',
        tutorId: mockTutor.id,
      } as MenorACargo);

      const menor = await service.obtenerMenor('menor-1', mockTutor.id);
      expect(menor.id).toBe('menor-1');
    });

    it('debe rechazar si el menor pertenece a otro tutor', async () => {
      menorRepo.findOne.mockResolvedValue({
        id: 'menor-1',
        tutorId: 'otro-tutor',
      } as MenorACargo);

      await expect(service.obtenerMenor('menor-1', mockTutor.id)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('debe actualizar la salud del menor', async () => {
      menorRepo.findOne.mockResolvedValue({
        id: 'menor-1',
        tutorId: mockTutor.id,
        alergias: null,
      } as MenorACargo);

      const res = await service.actualizarSaludMenor('menor-1', mockTutor.id, {
        alergias: 'Penicilina',
      });
      expect(res.alergias).toBe('Penicilina');
      expect(menorRepo.save).toHaveBeenCalled();
    });

    it('debe adjuntar documento de respaldo y actualizar estado', async () => {
      menorRepo.findOne.mockResolvedValue({
        id: 'menor-1',
        tutorId: mockTutor.id,
        estadoVerificacion: 'declarado',
      } as MenorACargo);

      const res = await service.adjuntarDocumento('menor-1', mockTutor.id, {
        documentoUrl: 'data:application/pdf;base64,partida',
        nombreArchivo: 'partida.pdf',
        tipoDocumento: 'partida_nacimiento',
      });

      expect(res.estadoVerificacion).toBe('documentado');
      expect(res.documentoRespaldoTipo).toBe('partida_nacimiento');
    });

    it('debe eliminar el perfil del menor', async () => {
      menorRepo.findOne.mockResolvedValue({
        id: 'menor-1',
        tutorId: mockTutor.id,
      } as MenorACargo);

      const res = await service.eliminarMenor('menor-1', mockTutor);
      expect(res.success).toBe(true);
      expect(menorRepo.remove).toHaveBeenCalled();
    });
  });
});
