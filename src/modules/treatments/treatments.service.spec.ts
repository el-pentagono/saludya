import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EstadoTratamiento } from '../../common/enums/estado-tratamiento.enum';
import { Rol } from '../../common/enums/rol.enum';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { UsuariosService } from '../usuarios/usuarios.service';
import { TreatmentFollowUp } from './entities/treatment-follow-up.entity';
import { Treatment } from './entities/treatment.entity';
import { TreatmentsService } from './treatments.service';

const paciente = { id: 'paciente-1', rol: Rol.PACIENTE } as Usuario;
const otroPaciente = { id: 'paciente-2', rol: Rol.PACIENTE } as Usuario;
const medico = { id: 'medico-1', rol: Rol.MEDICO } as Usuario;
const farmaceutico = { id: 'farmaceutico-1', rol: Rol.FARMACEUTICO } as Usuario;
const enfermero = { id: 'enfermero-1', rol: Rol.ENFERMERO } as Usuario;
const director = { id: 'director-1', rol: Rol.DIRECTOR } as Usuario;
const auditor = { id: 'auditor-1', rol: Rol.AUDITOR } as Usuario;

describe('TreatmentsService', () => {
  let service: TreatmentsService;
  let repo: { create: jest.Mock; save: jest.Mock; find: jest.Mock; findOne: jest.Mock };
  let seguimientosRepo: { create: jest.Mock; save: jest.Mock; find: jest.Mock };
  let usuariosService: { findOne: jest.Mock };

  beforeEach(async () => {
    repo = {
      create: jest.fn((data) => data),
      save: jest.fn((data) => Promise.resolve({ id: 'tratamiento-1', ...data })),
      find: jest.fn(),
      findOne: jest.fn(),
    };
    seguimientosRepo = {
      create: jest.fn((data) => data),
      save: jest.fn((data) => Promise.resolve({ id: 'seguimiento-1', ...data })),
      find: jest.fn(),
    };
    usuariosService = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TreatmentsService,
        { provide: getRepositoryToken(Treatment), useValue: repo },
        { provide: getRepositoryToken(TreatmentFollowUp), useValue: seguimientosRepo },
        { provide: UsuariosService, useValue: usuariosService },
      ],
    }).compile();

    service = module.get(TreatmentsService);
  });

  describe('prescribir', () => {
    it('crea un tratamiento en estado PRESCRITO', async () => {
      usuariosService.findOne.mockResolvedValue(paciente);

      const resultado = await service.prescribir(medico, {
        pacienteId: paciente.id,
        medicamento: 'Ibuprofeno',
        dosis: '400mg cada 8hs',
      });

      expect(resultado).toMatchObject({
        pacienteId: paciente.id,
        medicoId: medico.id,
        medicamento: 'Ibuprofeno',
      });
    });

    it('rechaza si el destinatario no tiene rol paciente', async () => {
      usuariosService.findOne.mockResolvedValue(enfermero);

      await expect(
        service.prescribir(medico, {
          pacienteId: enfermero.id,
          medicamento: 'x',
          dosis: 'x',
        }),
      ).rejects.toThrow(BadRequestException);
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

    it('filtra por medicoId cuando el usuario es médico', async () => {
      repo.find.mockResolvedValue([]);

      await service.listar(medico);

      expect(repo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { medicoId: medico.id } }),
      );
    });

    it('devuelve todos los tratamientos para farmacéutico, enfermero, director y auditor', async () => {
      repo.find.mockResolvedValue([]);

      for (const usuario of [farmaceutico, enfermero, director, auditor]) {
        await service.listar(usuario);
      }

      expect(repo.find).toHaveBeenCalledTimes(4);
      for (const call of repo.find.mock.calls) {
        expect(call[0].where).toBeUndefined();
      }
    });
  });

  describe('buscarPorId', () => {
    const tratamiento = {
      id: 'tratamiento-1',
      pacienteId: paciente.id,
      medicoId: medico.id,
      estado: EstadoTratamiento.PRESCRITO,
    } as Treatment;

    it('lanza NotFoundException si no existe', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.buscarPorId('inexistente', paciente)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('permite al paciente dueño verlo', async () => {
      repo.findOne.mockResolvedValue(tratamiento);

      await expect(service.buscarPorId(tratamiento.id, paciente)).resolves.toBe(tratamiento);
    });

    it('rechaza a otro paciente', async () => {
      repo.findOne.mockResolvedValue(tratamiento);

      await expect(service.buscarPorId(tratamiento.id, otroPaciente)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('permite a farmacéutico, enfermero, médico, director y auditor verlo', async () => {
      repo.findOne.mockResolvedValue(tratamiento);

      for (const usuario of [medico, farmaceutico, enfermero, director, auditor]) {
        await expect(service.buscarPorId(tratamiento.id, usuario)).resolves.toBe(tratamiento);
      }
    });
  });

  describe('dispensar', () => {
    it('marca el tratamiento como DISPENSADO', async () => {
      repo.findOne.mockResolvedValue({
        id: 'tratamiento-1',
        estado: EstadoTratamiento.PRESCRITO,
      } as Treatment);

      const resultado = await service.dispensar(farmaceutico, 'tratamiento-1');

      expect(resultado.estado).toBe(EstadoTratamiento.DISPENSADO);
      expect(resultado.farmaceuticoId).toBe(farmaceutico.id);
      expect(resultado.fechaDispensa).toBeInstanceOf(Date);
    });

    it('rechaza si ya fue dispensado', async () => {
      repo.findOne.mockResolvedValue({
        id: 'tratamiento-1',
        estado: EstadoTratamiento.DISPENSADO,
      } as Treatment);

      await expect(service.dispensar(farmaceutico, 'tratamiento-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('lanza NotFoundException si no existe', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.dispensar(farmaceutico, 'inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('agregarSeguimiento', () => {
    it('crea una nota de seguimiento asociada al tratamiento', async () => {
      repo.findOne.mockResolvedValue({ id: 'tratamiento-1' } as Treatment);

      const resultado = await service.agregarSeguimiento(enfermero, 'tratamiento-1', {
        nota: 'Paciente tolera bien la medicación',
      });

      expect(resultado).toMatchObject({
        treatmentId: 'tratamiento-1',
        enfermeroId: enfermero.id,
        nota: 'Paciente tolera bien la medicación',
      });
    });

    it('lanza NotFoundException si el tratamiento no existe', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(
        service.agregarSeguimiento(enfermero, 'inexistente', { nota: 'x' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('listarSeguimientos', () => {
    it('devuelve los seguimientos si el usuario tiene acceso al tratamiento', async () => {
      repo.findOne.mockResolvedValue({
        id: 'tratamiento-1',
        pacienteId: paciente.id,
      } as Treatment);
      seguimientosRepo.find.mockResolvedValue([]);

      await expect(service.listarSeguimientos('tratamiento-1', paciente)).resolves.toEqual([]);
    });

    it('rechaza a un paciente sin acceso al tratamiento', async () => {
      repo.findOne.mockResolvedValue({
        id: 'tratamiento-1',
        pacienteId: paciente.id,
      } as Treatment);

      await expect(
        service.listarSeguimientos('tratamiento-1', otroPaciente),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
