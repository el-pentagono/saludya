import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppointmentsService } from '../appointments/appointments.service';
import { EstadoTurno } from '../../common/enums/estado-turno.enum';
import { Rol } from '../../common/enums/rol.enum';
import { TreatmentsService } from '../treatments/treatments.service';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { DocumentsService } from './documents.service';
import { Document } from './entities/document.entity';
import { TRAMITEXPRESS_CLIENT } from './tramitexpress/tramitexpress-client.interface';

const paciente = { id: 'paciente-1', rol: Rol.PACIENTE, nombre: 'Ana', apellido: 'Gómez' } as Usuario;
const otroPaciente = { id: 'paciente-2', rol: Rol.PACIENTE } as Usuario;
const director = { id: 'director-1', rol: Rol.DIRECTOR } as Usuario;
const auditor = { id: 'auditor-1', rol: Rol.AUDITOR } as Usuario;
const medico = { id: 'medico-1', rol: Rol.MEDICO } as Usuario;

const resultadoTramitExpress = {
  tramiteId: 'tramite-1',
  numeroConstancia: 'TE-1',
  urlDescarga: 'http://localhost:3020/tramites/tramite-1/descargar',
  fechaEmision: new Date(),
};

describe('DocumentsService', () => {
  let service: DocumentsService;
  let repo: { create: jest.Mock; save: jest.Mock; find: jest.Mock; findOne: jest.Mock };
  let appointmentsService: { buscarPorId: jest.Mock };
  let treatmentsService: { buscarPorId: jest.Mock };
  let tramitExpress: { generarCertificado: jest.Mock };

  beforeEach(async () => {
    repo = {
      create: jest.fn((data) => data),
      save: jest.fn((data) => Promise.resolve({ id: 'documento-1', ...data })),
      find: jest.fn(),
      findOne: jest.fn(),
    };
    appointmentsService = { buscarPorId: jest.fn() };
    treatmentsService = { buscarPorId: jest.fn() };
    tramitExpress = { generarCertificado: jest.fn().mockResolvedValue(resultadoTramitExpress) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        { provide: getRepositoryToken(Document), useValue: repo },
        { provide: AppointmentsService, useValue: appointmentsService },
        { provide: TreatmentsService, useValue: treatmentsService },
        { provide: TRAMITEXPRESS_CLIENT, useValue: tramitExpress },
      ],
    }).compile();

    service = module.get(DocumentsService);
  });

  describe('generarConstanciaAtencion', () => {
    const turnoBase = {
      id: 'turno-1',
      pacienteId: paciente.id,
      medicoId: medico.id,
      estado: EstadoTurno.PENDIENTE,
      fecha: new Date(Date.now() - 24 * 60 * 60 * 1000),
    };

    it('genera la constancia para un turno propio, pasado y no cancelado', async () => {
      appointmentsService.buscarPorId.mockResolvedValue(turnoBase);

      const resultado = await service.generarConstanciaAtencion(paciente, 'turno-1');

      expect(tramitExpress.generarCertificado).toHaveBeenCalled();
      expect(resultado).toMatchObject({
        pacienteId: paciente.id,
        appointmentId: 'turno-1',
        tramiteId: 'tramite-1',
      });
    });

    it('propaga el error si el turno no es del paciente (via AppointmentsService)', async () => {
      appointmentsService.buscarPorId.mockRejectedValue(new ForbiddenException());

      await expect(
        service.generarConstanciaAtencion(paciente, 'turno-ajeno'),
      ).rejects.toThrow(ForbiddenException);
      expect(tramitExpress.generarCertificado).not.toHaveBeenCalled();
    });

    it('rechaza un turno cancelado', async () => {
      appointmentsService.buscarPorId.mockResolvedValue({
        ...turnoBase,
        estado: EstadoTurno.CANCELADO,
      });

      await expect(service.generarConstanciaAtencion(paciente, 'turno-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('rechaza un turno que todavía no ocurrió', async () => {
      appointmentsService.buscarPorId.mockResolvedValue({
        ...turnoBase,
        fecha: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      await expect(service.generarConstanciaAtencion(paciente, 'turno-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('generarCertificadoTratamiento', () => {
    it('genera el certificado para un tratamiento propio', async () => {
      treatmentsService.buscarPorId.mockResolvedValue({
        id: 'tratamiento-1',
        pacienteId: paciente.id,
        medicamento: 'Ibuprofeno',
        dosis: '400mg',
      });

      const resultado = await service.generarCertificadoTratamiento(paciente, 'tratamiento-1');

      expect(resultado).toMatchObject({
        pacienteId: paciente.id,
        treatmentId: 'tratamiento-1',
        tramiteId: 'tramite-1',
      });
    });

    it('propaga el error si el tratamiento no es del paciente (via TreatmentsService)', async () => {
      treatmentsService.buscarPorId.mockRejectedValue(new ForbiddenException());

      await expect(
        service.generarCertificadoTratamiento(paciente, 'tratamiento-ajeno'),
      ).rejects.toThrow(ForbiddenException);
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

    it('devuelve todos los documentos para director y auditor', async () => {
      repo.find.mockResolvedValue([]);

      await service.listar(director);
      await service.listar(auditor);

      expect(repo.find).toHaveBeenCalledTimes(2);
      for (const call of repo.find.mock.calls) {
        expect(call[0].where).toBeUndefined();
      }
    });

    it('devuelve lista vacía para roles sin relación con documentos', async () => {
      const resultado = await service.listar(medico);

      expect(resultado).toEqual([]);
      expect(repo.find).not.toHaveBeenCalled();
    });
  });

  describe('buscarPorId', () => {
    const documento = { id: 'documento-1', pacienteId: paciente.id } as Document;

    it('lanza NotFoundException si no existe', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.buscarPorId('inexistente', paciente)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('permite al paciente dueño verlo', async () => {
      repo.findOne.mockResolvedValue(documento);

      await expect(service.buscarPorId(documento.id, paciente)).resolves.toBe(documento);
    });

    it('rechaza a otro paciente', async () => {
      repo.findOne.mockResolvedValue(documento);

      await expect(service.buscarPorId(documento.id, otroPaciente)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('permite a director y auditor verlo', async () => {
      repo.findOne.mockResolvedValue(documento);

      await expect(service.buscarPorId(documento.id, director)).resolves.toBe(documento);
      await expect(service.buscarPorId(documento.id, auditor)).resolves.toBe(documento);
    });

    it('rechaza a roles sin relación con documentos', async () => {
      repo.findOne.mockResolvedValue(documento);

      await expect(service.buscarPorId(documento.id, medico)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
