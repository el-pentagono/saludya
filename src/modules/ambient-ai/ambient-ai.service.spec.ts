import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppointmentsService } from '../appointments/appointments.service';
import { Rol } from '../../common/enums/rol.enum';
import { MedicalRecordsService } from '../medical-records/medical-records.service';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { AmbientAiService } from './ambient-ai.service';
import { AMBIENT_AI_CLIENT } from './ambient-ai-client/ambient-ai-client.interface';
import { TranscripcionConsulta } from './entities/transcripcion-consulta.entity';

const paciente = { id: 'paciente-1', rol: Rol.PACIENTE, nombre: 'Ana', apellido: 'Gómez' } as Usuario;
const medico = { id: 'medico-1', rol: Rol.MEDICO, nombre: 'Juan', apellido: 'Pérez' } as Usuario;
const otroMedico = { id: 'medico-2', rol: Rol.MEDICO } as Usuario;
const director = { id: 'director-1', rol: Rol.DIRECTOR } as Usuario;
const auditor = { id: 'auditor-1', rol: Rol.AUDITOR } as Usuario;

const resultadoIa = {
  transcripcionCruda: 'texto crudo',
  resumen: 'resumen generado',
  puntosClave: ['punto 1'],
};

describe('AmbientAiService', () => {
  let service: AmbientAiService;
  let repo: { create: jest.Mock; save: jest.Mock; find: jest.Mock; findOne: jest.Mock };
  let appointmentsService: { buscarPorId: jest.Mock };
  let medicalRecordsService: { crear: jest.Mock };
  let ambientAi: { generarResumen: jest.Mock };

  beforeEach(async () => {
    repo = {
      create: jest.fn((data) => data),
      save: jest.fn((data) => Promise.resolve({ id: 'transcripcion-1', ...data })),
      find: jest.fn(),
      findOne: jest.fn(),
    };
    appointmentsService = { buscarPorId: jest.fn() };
    medicalRecordsService = { crear: jest.fn() };
    ambientAi = { generarResumen: jest.fn().mockResolvedValue(resultadoIa) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AmbientAiService,
        { provide: getRepositoryToken(TranscripcionConsulta), useValue: repo },
        { provide: AppointmentsService, useValue: appointmentsService },
        { provide: MedicalRecordsService, useValue: medicalRecordsService },
        { provide: AMBIENT_AI_CLIENT, useValue: ambientAi },
      ],
    }).compile();

    service = module.get(AmbientAiService);
  });

  describe('crear', () => {
    const turno = {
      id: 'turno-1',
      pacienteId: paciente.id,
      medicoId: medico.id,
      paciente,
      motivo: 'Control',
    };

    it('genera la transcripción a partir de un turno propio', async () => {
      appointmentsService.buscarPorId.mockResolvedValue(turno);
      repo.findOne.mockResolvedValue(null);

      const resultado = await service.crear(medico, { appointmentId: 'turno-1' });

      expect(appointmentsService.buscarPorId).toHaveBeenCalledWith('turno-1', medico);
      expect(ambientAi.generarResumen).toHaveBeenCalledWith(
        expect.objectContaining({
          contexto: expect.objectContaining({ pacienteNombre: 'Ana Gómez', medicoNombre: 'Juan Pérez' }),
        }),
      );
      expect(resultado).toMatchObject({
        appointmentId: 'turno-1',
        medicoId: medico.id,
        pacienteId: paciente.id,
        resumen: 'resumen generado',
      });
    });

    it('propaga el error si el turno no es del médico (via AppointmentsService)', async () => {
      appointmentsService.buscarPorId.mockRejectedValue(new ForbiddenException());

      await expect(service.crear(medico, { appointmentId: 'ajeno' })).rejects.toThrow(
        ForbiddenException,
      );
      expect(ambientAi.generarResumen).not.toHaveBeenCalled();
    });

    it('rechaza si ya existe una transcripción para ese turno', async () => {
      appointmentsService.buscarPorId.mockResolvedValue(turno);
      repo.findOne.mockResolvedValue({ id: 'existente' });

      await expect(service.crear(medico, { appointmentId: 'turno-1' })).rejects.toThrow(
        ConflictException,
      );
      expect(ambientAi.generarResumen).not.toHaveBeenCalled();
    });
  });

  describe('confirmar', () => {
    const transcripcionSinConfirmar = () =>
      ({
        id: 'transcripcion-1',
        medicoId: medico.id,
        pacienteId: paciente.id,
        resumen: 'resumen generado',
        medicalRecordId: null,
      }) as TranscripcionConsulta;

    it('genera la entrada en medical-records y marca la transcripción como confirmada', async () => {
      repo.findOne.mockResolvedValue(transcripcionSinConfirmar());
      medicalRecordsService.crear.mockResolvedValue({ id: 'entrada-1' });

      const resultado = await service.confirmar(medico, 'transcripcion-1', {
        diagnostico: 'Control de rutina',
      });

      expect(medicalRecordsService.crear).toHaveBeenCalledWith(medico, {
        pacienteId: paciente.id,
        diagnostico: 'Control de rutina',
        notas: 'resumen generado',
      });
      expect(resultado.medicalRecordId).toBe('entrada-1');
      expect(resultado.fechaConfirmacion).toBeInstanceOf(Date);
    });

    it('usa notasFinales en vez del resumen automático si se provee', async () => {
      repo.findOne.mockResolvedValue(transcripcionSinConfirmar());
      medicalRecordsService.crear.mockResolvedValue({ id: 'entrada-1' });

      await service.confirmar(medico, 'transcripcion-1', {
        diagnostico: 'Control de rutina',
        notasFinales: 'Notas editadas por el médico',
      });

      expect(medicalRecordsService.crear).toHaveBeenCalledWith(
        medico,
        expect.objectContaining({ notas: 'Notas editadas por el médico' }),
      );
    });

    it('rechaza a un médico distinto del dueño', async () => {
      repo.findOne.mockResolvedValue(transcripcionSinConfirmar());

      await expect(
        service.confirmar(otroMedico, 'transcripcion-1', { diagnostico: 'x' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('rechaza confirmar una transcripción ya confirmada', async () => {
      repo.findOne.mockResolvedValue({
        ...transcripcionSinConfirmar(),
        medicalRecordId: 'entrada-previa',
      });

      await expect(
        service.confirmar(medico, 'transcripcion-1', { diagnostico: 'x' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('lanza NotFoundException si no existe', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(
        service.confirmar(medico, 'inexistente', { diagnostico: 'x' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('listar', () => {
    it('filtra por medicoId cuando el usuario es médico', async () => {
      repo.find.mockResolvedValue([]);

      await service.listar(medico);

      expect(repo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { medicoId: medico.id } }),
      );
    });

    it('no filtra (ve todo) para director y auditor', async () => {
      repo.find.mockResolvedValue([]);

      await service.listar(director);
      await service.listar(auditor);

      expect(repo.find).toHaveBeenCalledTimes(2);
      for (const call of repo.find.mock.calls) {
        expect(call[0].where).toBeUndefined();
      }
    });

    it('devuelve lista vacía para el paciente (sin acceso al borrador)', async () => {
      const resultado = await service.listar(paciente);

      expect(resultado).toEqual([]);
      expect(repo.find).not.toHaveBeenCalled();
    });
  });

  describe('buscarPorId', () => {
    const transcripcion = { id: 'transcripcion-1', medicoId: medico.id } as TranscripcionConsulta;

    it('lanza NotFoundException si no existe', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.buscarPorId('inexistente', medico)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('permite al médico dueño verla', async () => {
      repo.findOne.mockResolvedValue(transcripcion);

      await expect(service.buscarPorId(transcripcion.id, medico)).resolves.toBe(transcripcion);
    });

    it('rechaza a un médico distinto del dueño', async () => {
      repo.findOne.mockResolvedValue(transcripcion);

      await expect(service.buscarPorId(transcripcion.id, otroMedico)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('permite a director y auditor verla', async () => {
      repo.findOne.mockResolvedValue(transcripcion);

      await expect(service.buscarPorId(transcripcion.id, director)).resolves.toBe(transcripcion);
      await expect(service.buscarPorId(transcripcion.id, auditor)).resolves.toBe(transcripcion);
    });

    it('rechaza al paciente (sin acceso al borrador)', async () => {
      repo.findOne.mockResolvedValue(transcripcion);

      await expect(service.buscarPorId(transcripcion.id, paciente)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
