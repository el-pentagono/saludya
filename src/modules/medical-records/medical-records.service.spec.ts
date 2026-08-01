import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppointmentsService } from '../appointments/appointments.service';
import { Rol } from '../../common/enums/rol.enum';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { UsuariosService } from '../usuarios/usuarios.service';
import { MedicalRecord } from './entities/medical-record.entity';
import { MedicalRecordsService } from './medical-records.service';

const paciente = { id: 'paciente-1', rol: Rol.PACIENTE } as Usuario;
const otroPaciente = { id: 'paciente-2', rol: Rol.PACIENTE } as Usuario;
const medico = { id: 'medico-1', rol: Rol.MEDICO } as Usuario;
const otroMedico = { id: 'medico-2', rol: Rol.MEDICO } as Usuario;
const director = { id: 'director-1', rol: Rol.DIRECTOR } as Usuario;
const auditor = { id: 'auditor-1', rol: Rol.AUDITOR } as Usuario;
const enfermero = { id: 'enfermero-1', rol: Rol.ENFERMERO } as Usuario;

describe('MedicalRecordsService', () => {
  let service: MedicalRecordsService;
  let repo: { create: jest.Mock; save: jest.Mock; find: jest.Mock; findOne: jest.Mock; count: jest.Mock };
  let usuariosService: { findOne: jest.Mock };
  let appointmentsService: { existeVinculo: jest.Mock };

  beforeEach(async () => {
    repo = {
      create: jest.fn((data) => data),
      save: jest.fn((data) => Promise.resolve({ id: 'entrada-1', ...data })),
      find: jest.fn(),
      findOne: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
    };

    usuariosService = { findOne: jest.fn() };
    appointmentsService = { existeVinculo: jest.fn().mockResolvedValue(false) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicalRecordsService,
        { provide: getRepositoryToken(MedicalRecord), useValue: repo },
        { provide: UsuariosService, useValue: usuariosService },
        { provide: AppointmentsService, useValue: appointmentsService },
      ],
    }).compile();

    service = module.get(MedicalRecordsService);
  });

  describe('crear', () => {
    it('crea una entrada cuando el destinatario es un paciente', async () => {
      usuariosService.findOne.mockResolvedValue(paciente);

      const resultado = await service.crear(medico, {
        pacienteId: paciente.id,
        diagnostico: 'Control de rutina',
      });

      expect(usuariosService.findOne).toHaveBeenCalledWith(paciente.id);
      expect(resultado).toMatchObject({
        pacienteId: paciente.id,
        medicoId: medico.id,
        diagnostico: 'Control de rutina',
      });
    });

    it('rechaza si el destinatario no tiene rol paciente', async () => {
      usuariosService.findOne.mockResolvedValue(enfermero);

      await expect(
        service.crear(medico, { pacienteId: enfermero.id, diagnostico: 'x' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('historialDePaciente', () => {
    it('permite al paciente ver su propia historia', async () => {
      repo.find.mockResolvedValue([]);

      await service.historialDePaciente(paciente.id, paciente);

      expect(repo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { pacienteId: paciente.id } }),
      );
    });

    it('rechaza a un paciente que intenta ver la historia de otro paciente', async () => {
      await expect(
        service.historialDePaciente(otroPaciente.id, paciente),
      ).rejects.toThrow(ForbiddenException);
    });

    it('permite a un médico con turno con el paciente ver su historia', async () => {
      repo.count.mockResolvedValue(0);
      appointmentsService.existeVinculo.mockResolvedValue(true);
      repo.find.mockResolvedValue([]);

      await expect(
        service.historialDePaciente(paciente.id, otroMedico),
      ).resolves.toEqual([]);
      expect(appointmentsService.existeVinculo).toHaveBeenCalledWith(otroMedico.id, paciente.id);
    });

    it('permite a un médico que ya escribió una entrada del paciente, aunque no tenga turno', async () => {
      repo.count.mockResolvedValue(1);
      appointmentsService.existeVinculo.mockResolvedValue(false);
      repo.find.mockResolvedValue([]);

      await expect(
        service.historialDePaciente(paciente.id, medico),
      ).resolves.toEqual([]);
      expect(appointmentsService.existeVinculo).not.toHaveBeenCalled();
    });

    it('rechaza a un médico sin turno ni entradas previas con el paciente', async () => {
      repo.count.mockResolvedValue(0);
      appointmentsService.existeVinculo.mockResolvedValue(false);

      await expect(
        service.historialDePaciente(paciente.id, otroMedico),
      ).rejects.toThrow(ForbiddenException);
    });

    it('permite a director y auditor ver la historia de cualquier paciente', async () => {
      repo.find.mockResolvedValue([]);

      await expect(service.historialDePaciente(paciente.id, director)).resolves.toEqual([]);
      await expect(service.historialDePaciente(paciente.id, auditor)).resolves.toEqual([]);
      expect(appointmentsService.existeVinculo).not.toHaveBeenCalled();
    });

    it('rechaza a roles sin relación clínica (enfermero, farmacéutico)', async () => {
      await expect(
        service.historialDePaciente(paciente.id, enfermero),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('buscarPorId', () => {
    const entrada = {
      id: 'entrada-1',
      pacienteId: paciente.id,
      medicoId: medico.id,
      diagnostico: 'Control',
    } as MedicalRecord;

    it('lanza NotFoundException si la entrada no existe', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.buscarPorId('inexistente', paciente)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('permite al paciente dueño ver la entrada', async () => {
      repo.findOne.mockResolvedValue(entrada);

      await expect(service.buscarPorId(entrada.id, paciente)).resolves.toBe(entrada);
    });

    it('rechaza a otro paciente que no es el dueño', async () => {
      repo.findOne.mockResolvedValue(entrada);

      await expect(service.buscarPorId(entrada.id, otroPaciente)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('permite al médico autor ver la entrada (ya tiene vínculo por haberla escrito)', async () => {
      repo.findOne.mockResolvedValue(entrada);
      repo.count.mockResolvedValue(1);

      await expect(service.buscarPorId(entrada.id, medico)).resolves.toBe(entrada);
    });

    it('rechaza a un médico sin vínculo con el paciente de la entrada', async () => {
      repo.findOne.mockResolvedValue(entrada);
      repo.count.mockResolvedValue(0);
      appointmentsService.existeVinculo.mockResolvedValue(false);

      await expect(service.buscarPorId(entrada.id, otroMedico)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
