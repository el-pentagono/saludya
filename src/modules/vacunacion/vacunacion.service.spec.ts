import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EstadoAplicacionVacuna } from '../../common/enums/estado-aplicacion-vacuna.enum';
import { Rol } from '../../common/enums/rol.enum';
import { Appointment } from '../appointments/entities/appointment.entity';
import { MenorACargo } from '../familia/entities/menor-a-cargo.entity';
import { FamiliaService } from '../familia/familia.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { AplicacionVacuna } from './entities/aplicacion-vacuna.entity';
import { CatalogoVacuna } from './entities/catalogo-vacuna.entity';
import { VacunacionService } from './vacunacion.service';

const tutor = { id: 'tutor-1', rol: Rol.PACIENTE } as Usuario;
const otroTutor = { id: 'tutor-2', rol: Rol.PACIENTE } as Usuario;
const medico = { id: 'medico-1', nombre: 'Ana', apellido: 'Ruiz', rol: Rol.MEDICO } as Usuario;
const enfermero = { id: 'enfermero-1', rol: Rol.ENFERMERO } as Usuario;
const farmaceutico = { id: 'farmaceutico-1', rol: Rol.FARMACEUTICO } as Usuario;

const menor = {
  id: 'menor-1',
  tutorId: 'tutor-1',
  nombre: 'Tomás',
  apellido: 'Gómez',
  dni: '99000111',
  fechaNacimiento: '2025-01-01',
} as MenorACargo;

function hoyMasDias(dias: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

describe('VacunacionService', () => {
  let service: VacunacionService;
  let catalogoRepo: { find: jest.Mock; findOne: jest.Mock; create: jest.Mock; save: jest.Mock };
  let aplicacionRepo: {
    count: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    save: jest.Mock;
    create: jest.Mock;
  };
  let menorRepo: { findOne: jest.Mock };
  let appointmentsRepo: { findOne: jest.Mock };
  let familiaService: { obtenerMenor: jest.Mock };
  let notificationsService: { crear: jest.Mock };

  beforeEach(async () => {
    catalogoRepo = {
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn(),
      create: jest.fn((d) => d),
      save: jest.fn((d) => Promise.resolve({ id: 'cat-1', ...d })),
    };
    aplicacionRepo = {
      count: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn((d) => Promise.resolve(Array.isArray(d) ? d : { id: 'ap-1', ...d })),
      create: jest.fn((d) => d),
    };
    menorRepo = { findOne: jest.fn() };
    appointmentsRepo = { findOne: jest.fn() };
    familiaService = { obtenerMenor: jest.fn() };
    notificationsService = { crear: jest.fn().mockResolvedValue({}) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VacunacionService,
        { provide: getRepositoryToken(CatalogoVacuna), useValue: catalogoRepo },
        { provide: getRepositoryToken(AplicacionVacuna), useValue: aplicacionRepo },
        { provide: getRepositoryToken(MenorACargo), useValue: menorRepo },
        { provide: getRepositoryToken(Appointment), useValue: appointmentsRepo },
        { provide: FamiliaService, useValue: familiaService },
        { provide: NotificationsService, useValue: notificationsService },
      ],
    }).compile();

    service = module.get(VacunacionService);
  });

  describe('sembrarCalendarioNacional (onModuleInit)', () => {
    it('siembra el catálogo solo si el código todavía no existe', async () => {
      catalogoRepo.findOne.mockResolvedValue(null);

      await service.onModuleInit();

      expect(catalogoRepo.save).toHaveBeenCalled();
      // Debe consultar existencia por código antes de crear cada fila
      expect(catalogoRepo.findOne).toHaveBeenCalled();
    });

    it('no duplica una dosis del catálogo que ya fue sembrada', async () => {
      catalogoRepo.findOne.mockResolvedValue({ id: 'ya-existe' });

      await service.onModuleInit();

      expect(catalogoRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('listarLibreta', () => {
    it('un tutor solo puede ver la libreta de su propio menor', async () => {
      familiaService.obtenerMenor.mockResolvedValue(menor);
      aplicacionRepo.count.mockResolvedValue(1);
      aplicacionRepo.find.mockResolvedValue([]);

      await service.listarLibreta('menor-1', tutor);

      expect(familiaService.obtenerMenor).toHaveBeenCalledWith('menor-1', 'tutor-1');
    });

    it('propaga el ForbiddenException si el tutor no es dueño del menor', async () => {
      familiaService.obtenerMenor.mockRejectedValue(new ForbiddenException());

      await expect(service.listarLibreta('menor-1', otroTutor)).rejects.toThrow(ForbiddenException);
    });

    it('un médico puede ver la libreta de cualquier menor sin chequeo de tutor', async () => {
      menorRepo.findOne.mockResolvedValue(menor);
      aplicacionRepo.count.mockResolvedValue(1);
      aplicacionRepo.find.mockResolvedValue([]);

      await service.listarLibreta('menor-1', medico);

      expect(familiaService.obtenerMenor).not.toHaveBeenCalled();
      expect(menorRepo.findOne).toHaveBeenCalledWith({ where: { id: 'menor-1' } });
    });

    it('rechaza roles sin acceso clínico ni de tutor (ej. farmacéutico)', async () => {
      await expect(service.listarLibreta('menor-1', farmaceutico)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('genera la libreta completa a partir del catálogo si todavía no existe', async () => {
      familiaService.obtenerMenor.mockResolvedValue(menor);
      aplicacionRepo.count.mockResolvedValue(0);
      catalogoRepo.find.mockResolvedValue([
        { id: 'bcg', edadObjetivoDias: 0, ventanaAlertaDias: 15 },
        { id: 'penta-2m', edadObjetivoDias: 60, ventanaAlertaDias: 15 },
      ]);
      aplicacionRepo.find.mockResolvedValue([]);

      await service.listarLibreta('menor-1', tutor);

      expect(aplicacionRepo.save).toHaveBeenCalledWith([
        expect.objectContaining({ menorId: 'menor-1', catalogoVacunaId: 'bcg', fechaProgramada: '2025-01-01' }),
        expect.objectContaining({ menorId: 'menor-1', catalogoVacunaId: 'penta-2m', fechaProgramada: '2025-03-02' }),
      ]);
    });

    it('no regenera la libreta si ya tiene filas', async () => {
      familiaService.obtenerMenor.mockResolvedValue(menor);
      aplicacionRepo.count.mockResolvedValue(5);
      aplicacionRepo.find.mockResolvedValue([]);

      await service.listarLibreta('menor-1', tutor);

      expect(aplicacionRepo.save).not.toHaveBeenCalled();
    });

    it('calcula la urgencia de cada dosis según la fecha programada', async () => {
      familiaService.obtenerMenor.mockResolvedValue(menor);
      aplicacionRepo.count.mockResolvedValue(3);
      aplicacionRepo.find.mockResolvedValue([
        {
          id: 'ap-aplicada',
          estado: EstadoAplicacionVacuna.APLICADA,
          fechaProgramada: hoyMasDias(-100),
          catalogoVacuna: { ventanaAlertaDias: 15 },
        },
        {
          id: 'ap-atrasada',
          estado: EstadoAplicacionVacuna.PENDIENTE,
          fechaProgramada: hoyMasDias(-2),
          catalogoVacuna: { ventanaAlertaDias: 15 },
        },
        {
          id: 'ap-proxima',
          estado: EstadoAplicacionVacuna.PENDIENTE,
          fechaProgramada: hoyMasDias(5),
          catalogoVacuna: { ventanaAlertaDias: 15 },
        },
        {
          id: 'ap-pendiente',
          estado: EstadoAplicacionVacuna.PENDIENTE,
          fechaProgramada: hoyMasDias(60),
          catalogoVacuna: { ventanaAlertaDias: 15 },
        },
      ]);

      const libreta = await service.listarLibreta('menor-1', tutor);

      expect(libreta.find((a) => a.id === 'ap-aplicada')!.urgencia).toBe('aplicada');
      expect(libreta.find((a) => a.id === 'ap-atrasada')!.urgencia).toBe('atrasada');
      expect(libreta.find((a) => a.id === 'ap-proxima')!.urgencia).toBe('proxima');
      expect(libreta.find((a) => a.id === 'ap-pendiente')!.urgencia).toBe('pendiente');
    });
  });

  describe('buscarMenorPorDni', () => {
    it('devuelve el menor si existe con ese DNI', async () => {
      menorRepo.findOne.mockResolvedValue(menor);

      await expect(service.buscarMenorPorDni('99000111')).resolves.toBe(menor);
    });

    it('lanza NotFoundException si no hay un menor con ese DNI', async () => {
      menorRepo.findOne.mockResolvedValue(null);

      await expect(service.buscarMenorPorDni('00000000')).rejects.toThrow(NotFoundException);
    });
  });

  describe('registrarAplicacion', () => {
    const aplicacionPendiente = {
      id: 'ap-1',
      estado: EstadoAplicacionVacuna.PENDIENTE,
      catalogoVacuna: { nombre: 'BCG', dosis: 'Dosis única' },
      menor,
    };

    it('marca la dosis como aplicada y notifica al tutor', async () => {
      aplicacionRepo.findOne.mockResolvedValue({ ...aplicacionPendiente });

      const resultado = await service.registrarAplicacion(medico, 'ap-1', {
        loteVacuna: 'L123',
        lugarAplicacion: 'CAPS Norte',
      });

      expect(resultado.estado).toBe(EstadoAplicacionVacuna.APLICADA);
      expect(resultado.medicoAplicadorId).toBe('medico-1');
      expect(resultado.fechaAplicacion).toBeTruthy();
      expect(notificationsService.crear).toHaveBeenCalledWith(
        'tutor-1',
        expect.any(String),
        expect.stringContaining('BCG'),
        'vacuna_aplicada',
        expect.objectContaining({ menorId: 'menor-1' }),
      );
    });

    it('rechaza registrar dos veces la misma dosis', async () => {
      aplicacionRepo.findOne.mockResolvedValue({
        ...aplicacionPendiente,
        estado: EstadoAplicacionVacuna.APLICADA,
      });

      await expect(service.registrarAplicacion(medico, 'ap-1', {})).rejects.toThrow(
        BadRequestException,
      );
    });

    it('lanza NotFoundException si la dosis no existe', async () => {
      aplicacionRepo.findOne.mockResolvedValue(null);

      await expect(service.registrarAplicacion(medico, 'ap-inexistente', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('vincularTurno', () => {
    const aplicacionPendiente = { id: 'ap-1', menorId: 'menor-1', menor };

    it('vincula el turno cuando pertenece al tutor y al mismo menor', async () => {
      aplicacionRepo.findOne.mockResolvedValue({ ...aplicacionPendiente });
      appointmentsRepo.findOne.mockResolvedValue({
        id: 'turno-1',
        pacienteId: 'tutor-1',
        menorId: 'menor-1',
      });

      const resultado = await service.vincularTurno(tutor, 'ap-1', { appointmentId: 'turno-1' });

      expect(resultado.appointmentId).toBe('turno-1');
    });

    it('rechaza vincular la libreta de un menor ajeno', async () => {
      aplicacionRepo.findOne.mockResolvedValue({ ...aplicacionPendiente });

      await expect(
        service.vincularTurno(otroTutor, 'ap-1', { appointmentId: 'turno-1' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('rechaza un turno que no corresponde al mismo menor', async () => {
      aplicacionRepo.findOne.mockResolvedValue({ ...aplicacionPendiente });
      appointmentsRepo.findOne.mockResolvedValue({
        id: 'turno-1',
        pacienteId: 'tutor-1',
        menorId: 'otro-menor',
      });

      await expect(
        service.vincularTurno(tutor, 'ap-1', { appointmentId: 'turno-1' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('verificarProximasDosis (cron)', () => {
    it('notifica y marca alertaProximaEnviada una sola vez para una dosis próxima', async () => {
      const aplicacion = {
        id: 'ap-1',
        estado: EstadoAplicacionVacuna.PENDIENTE,
        fechaProgramada: hoyMasDias(5),
        alertaProximaEnviada: false,
        alertaAtrasadaEnviada: false,
        catalogoVacuna: { nombre: 'BCG', dosis: 'Dosis única', ventanaAlertaDias: 15 },
        menor,
      };
      aplicacionRepo.find.mockResolvedValue([aplicacion]);

      await service.verificarProximasDosis();

      expect(notificationsService.crear).toHaveBeenCalledWith(
        'tutor-1',
        expect.stringContaining('Próxima'),
        expect.any(String),
        'vacuna_proxima',
        expect.any(Object),
      );
      expect(aplicacionRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ alertaProximaEnviada: true }),
      );
    });

    it('no vuelve a notificar una dosis próxima que ya fue alertada', async () => {
      aplicacionRepo.find.mockResolvedValue([
        {
          id: 'ap-1',
          estado: EstadoAplicacionVacuna.PENDIENTE,
          fechaProgramada: hoyMasDias(5),
          alertaProximaEnviada: true,
          alertaAtrasadaEnviada: false,
          catalogoVacuna: { ventanaAlertaDias: 15 },
          menor,
        },
      ]);

      await service.verificarProximasDosis();

      expect(notificationsService.crear).not.toHaveBeenCalled();
    });

    it('notifica una dosis atrasada con el tipo vacuna_atrasada', async () => {
      const aplicacion = {
        id: 'ap-2',
        estado: EstadoAplicacionVacuna.PENDIENTE,
        fechaProgramada: hoyMasDias(-3),
        alertaProximaEnviada: false,
        alertaAtrasadaEnviada: false,
        catalogoVacuna: { nombre: 'Pentavalente', dosis: '1ra dosis', ventanaAlertaDias: 15 },
        menor,
      };
      aplicacionRepo.find.mockResolvedValue([aplicacion]);

      await service.verificarProximasDosis();

      expect(notificationsService.crear).toHaveBeenCalledWith(
        'tutor-1',
        expect.stringContaining('atrasada'),
        expect.any(String),
        'vacuna_atrasada',
        expect.any(Object),
      );
      expect(aplicacionRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ alertaAtrasadaEnviada: true }),
      );
    });

    it('no notifica dosis que todavía están fuera de la ventana de alerta', async () => {
      aplicacionRepo.find.mockResolvedValue([
        {
          id: 'ap-3',
          estado: EstadoAplicacionVacuna.PENDIENTE,
          fechaProgramada: hoyMasDias(60),
          alertaProximaEnviada: false,
          alertaAtrasadaEnviada: false,
          catalogoVacuna: { ventanaAlertaDias: 15 },
          menor,
        },
      ]);

      await service.verificarProximasDosis();

      expect(notificationsService.crear).not.toHaveBeenCalled();
      expect(aplicacionRepo.save).not.toHaveBeenCalled();
    });
  });
});
