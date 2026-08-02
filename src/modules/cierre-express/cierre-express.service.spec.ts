import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsService } from '../appointments/appointments.service';
import { Rol } from '../../common/enums/rol.enum';
import { DocumentsService } from '../documents/documents.service';
import { MedicalRecordsService } from '../medical-records/medical-records.service';
import { ObrasSocialesService } from '../obras-sociales/obras-sociales.service';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { CierreExpressService } from './cierre-express.service';

const medico = { id: 'medico-1', rol: Rol.MEDICO } as Usuario;

describe('CierreExpressService', () => {
  let service: CierreExpressService;
  let appointmentsService: { buscarPorId: jest.Mock; cerrar: jest.Mock };
  let documentsService: { generarConstanciaAtencionParaTurno: jest.Mock };
  let obrasSocialesService: { findOne: jest.Mock };
  let medicalRecordsService: { crear: jest.Mock };

  beforeEach(async () => {
    appointmentsService = { buscarPorId: jest.fn(), cerrar: jest.fn() };
    documentsService = { generarConstanciaAtencionParaTurno: jest.fn() };
    obrasSocialesService = { findOne: jest.fn() };
    medicalRecordsService = { crear: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CierreExpressService,
        { provide: AppointmentsService, useValue: appointmentsService },
        { provide: DocumentsService, useValue: documentsService },
        { provide: ObrasSocialesService, useValue: obrasSocialesService },
        { provide: MedicalRecordsService, useValue: medicalRecordsService },
      ],
    }).compile();

    service = module.get(CierreExpressService);
  });

  it('cierra el turno, valida la obra social, emite la constancia y crea la entrada clínica', async () => {
    appointmentsService.buscarPorId.mockResolvedValue({
      id: 'turno-1',
      pacienteId: 'paciente-1',
      paciente: { obraSocialId: 'obra-social-1' },
    });
    obrasSocialesService.findOne.mockResolvedValue({ id: 'obra-social-1' });
    appointmentsService.cerrar.mockResolvedValue({
      id: 'turno-1',
      pacienteId: 'paciente-1',
      estado: 'cerrado',
    });
    documentsService.generarConstanciaAtencionParaTurno.mockResolvedValue({ id: 'documento-1' });
    medicalRecordsService.crear.mockResolvedValue({ id: 'entrada-1' });

    const resultado = await service.cerrarTurno(medico, 'turno-1', {
      diagnostico: 'Control de rutina',
    });

    expect(obrasSocialesService.findOne).toHaveBeenCalledWith('obra-social-1');
    expect(appointmentsService.cerrar).toHaveBeenCalledWith(medico, 'turno-1', {
      diagnostico: 'Control de rutina',
      obraSocialLiquidacionId: 'obra-social-1',
    });
    expect(documentsService.generarConstanciaAtencionParaTurno).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'turno-1' }),
    );
    expect(medicalRecordsService.crear).toHaveBeenCalledWith(medico, {
      pacienteId: 'paciente-1',
      diagnostico: 'Control de rutina',
    });
    expect(resultado).toEqual({
      turno: expect.objectContaining({ id: 'turno-1' }),
      documento: { id: 'documento-1' },
      entradaClinica: { id: 'entrada-1' },
    });
  });

  it('no valida obra social ni la pasa a cerrar si el paciente no tiene una asignada', async () => {
    appointmentsService.buscarPorId.mockResolvedValue({
      id: 'turno-1',
      pacienteId: 'paciente-1',
      paciente: { obraSocialId: null },
    });
    appointmentsService.cerrar.mockResolvedValue({ id: 'turno-1', pacienteId: 'paciente-1' });
    documentsService.generarConstanciaAtencionParaTurno.mockResolvedValue({ id: 'documento-1' });
    medicalRecordsService.crear.mockResolvedValue({ id: 'entrada-1' });

    await service.cerrarTurno(medico, 'turno-1', { diagnostico: 'Control' });

    expect(obrasSocialesService.findOne).not.toHaveBeenCalled();
    expect(appointmentsService.cerrar).toHaveBeenCalledWith(
      medico,
      'turno-1',
      expect.objectContaining({ obraSocialLiquidacionId: null }),
    );
  });

  it('propaga el error si el turno no es del médico (via AppointmentsService.buscarPorId)', async () => {
    appointmentsService.buscarPorId.mockRejectedValue(new ForbiddenException());

    await expect(
      service.cerrarTurno(medico, 'ajeno', { diagnostico: 'x' }),
    ).rejects.toThrow(ForbiddenException);
    expect(appointmentsService.cerrar).not.toHaveBeenCalled();
    expect(documentsService.generarConstanciaAtencionParaTurno).not.toHaveBeenCalled();
    expect(medicalRecordsService.crear).not.toHaveBeenCalled();
  });

  it('propaga el error si el turno no está pendiente (via AppointmentsService.cerrar) sin generar documento ni entrada clínica', async () => {
    appointmentsService.buscarPorId.mockResolvedValue({
      id: 'turno-1',
      pacienteId: 'paciente-1',
      paciente: { obraSocialId: null },
    });
    appointmentsService.cerrar.mockRejectedValue(new BadRequestException());

    await expect(
      service.cerrarTurno(medico, 'turno-1', { diagnostico: 'x' }),
    ).rejects.toThrow(BadRequestException);
    expect(documentsService.generarConstanciaAtencionParaTurno).not.toHaveBeenCalled();
    expect(medicalRecordsService.crear).not.toHaveBeenCalled();
  });
});
