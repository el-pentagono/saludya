import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsService } from '../appointments/appointments.service';
import { Rol } from '../../common/enums/rol.enum';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { TeleconsultService } from './teleconsult.service';

const paciente = { id: 'paciente-1', rol: Rol.PACIENTE } as Usuario;

describe('TeleconsultService', () => {
  let service: TeleconsultService;
  let appointmentsService: { buscarPorId: jest.Mock };
  let configService: { get: jest.Mock };

  beforeEach(async () => {
    appointmentsService = { buscarPorId: jest.fn() };
    configService = {
      get: jest.fn((key: string, fallback?: string) => {
        if (key === 'VIDEO_PROVIDER') return 'jitsi';
        if (key === 'VIDEO_BASE_URL') return 'https://meet.jit.si';
        return fallback;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeleconsultService,
        { provide: AppointmentsService, useValue: appointmentsService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get(TeleconsultService);
  });

  it('devuelve la sala calculada a partir del ID del turno', async () => {
    appointmentsService.buscarPorId.mockResolvedValue({ id: 'turno-1' });

    const resultado = await service.obtenerSala('turno-1', paciente);

    expect(appointmentsService.buscarPorId).toHaveBeenCalledWith('turno-1', paciente);
    expect(resultado).toEqual({
      proveedor: 'jitsi',
      salaUrl: 'https://meet.jit.si/saludya-turno-1',
    });
  });

  it('propaga ForbiddenException si el usuario no tiene acceso al turno', async () => {
    appointmentsService.buscarPorId.mockRejectedValue(new ForbiddenException());

    await expect(service.obtenerSala('ajeno', paciente)).rejects.toThrow(ForbiddenException);
  });

  it('propaga NotFoundException si el turno no existe', async () => {
    appointmentsService.buscarPorId.mockRejectedValue(new NotFoundException());

    await expect(service.obtenerSala('inexistente', paciente)).rejects.toThrow(
      NotFoundException,
    );
  });
});
