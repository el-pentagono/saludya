import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';
import { EstadoLiquidacion } from '../../common/enums/estado-liquidacion.enum';
import { EstadoTurno } from '../../common/enums/estado-turno.enum';
import { Rol } from '../../common/enums/rol.enum';
import { DisponibilidadService } from '../disponibilidad/disponibilidad.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { UsuariosService } from '../usuarios/usuarios.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Appointment } from './entities/appointment.entity';

export interface OpcionTurnoCruzado {
  fecha: string;
  fechaFormateada: string;
  diaSemana: string;
  hora: string;
}

export interface ResultadoDisponibilidadCruzada {
  opciones: OpcionTurnoCruzado[];
  mensaje: string | null;
}

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly repo: Repository<Appointment>,
    private readonly usuariosService: UsuariosService,
    private readonly disponibilidadService: DisponibilidadService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async crear(usuario: Usuario, dto: CreateAppointmentDto) {
    let pacienteId: string;
    let medicoId: string;
    let medicoNombre = '';

    if (usuario.rol === Rol.MEDICO) {
      if (!dto.pacienteId) {
        throw new BadRequestException('Se debe especificar el paciente para quien se agenda el turno');
      }
      pacienteId = dto.pacienteId;
      medicoId = usuario.id;
      medicoNombre = `Dr/a. ${usuario.nombre} ${usuario.apellido}`;

      const paciente = await this.usuariosService.findOne(pacienteId);
      if (paciente.rol !== Rol.PACIENTE) {
        throw new BadRequestException('El usuario indicado no es un paciente');
      }
    } else if (usuario.rol === Rol.PACIENTE) {
      if (!dto.medicoId) {
        throw new BadRequestException('Se debe especificar el médico para el turno');
      }
      pacienteId = usuario.id;
      medicoId = dto.medicoId;

      const medico = await this.usuariosService.findOne(medicoId);
      if (medico.rol !== Rol.MEDICO) {
        throw new BadRequestException('El profesional indicado no es un médico');
      }
      medicoNombre = `Dr/a. ${medico.nombre} ${medico.apellido}`;
    } else {
      throw new ForbiddenException('Solo pacientes o médicos pueden agendar turnos');
    }

    const fecha = new Date(dto.fecha);
    if (fecha.getTime() <= Date.now()) {
      throw new BadRequestException('La fecha del turno debe ser futura');
    }

    const turno = this.repo.create({
      pacienteId,
      medicoId,
      menorId: dto.menorId,
      fecha,
      motivo: dto.motivo,
    });
    const guardado = await this.repo.save(turno);

    // Si quien agendó fue el médico, notificar automáticamente al paciente
    if (usuario.rol === Rol.MEDICO) {
      try {
        await this.notificationsService.crear(
          pacienteId,
          'Nuevo turno médico programado',
          `El ${medicoNombre} te agendó una consulta para el ${fecha.toLocaleString('es-AR')}${dto.motivo ? ` (${dto.motivo})` : ''}.`,
          'turno_agendado',
        );
      } catch {
        // En caso de fallo en notificación, no bloquear creación del turno
      }
    }

    return guardado;
  }

  async obtenerDisponibilidadCruzada(
    medicoId: string,
    pacienteId: string,
    diasAdelante = 15,
  ): Promise<ResultadoDisponibilidadCruzada> {
    const medico = await this.usuariosService.findOne(medicoId);
    if (medico.rol !== Rol.MEDICO) {
      throw new BadRequestException('El profesional indicado no es un médico');
    }

    const paciente = await this.usuariosService.findOne(pacienteId);
    if (paciente.rol !== Rol.PACIENTE) {
      throw new BadRequestException('El usuario indicado no es un paciente');
    }

    const ahora = new Date();
    const fechaLimite = new Date(ahora.getTime() + diasAdelante * 24 * 60 * 60 * 1000);

    // 1. Turnos activos del médico en el período
    const turnosMedico = await this.repo.find({
      where: {
        medicoId,
        estado: In([EstadoTurno.PENDIENTE, EstadoTurno.CERRADO]),
        fecha: Between(ahora, fechaLimite),
      },
    });

    // 2. Turnos activos del paciente con cualquier médico en el período
    const turnosPaciente = await this.repo.find({
      where: {
        pacienteId,
        estado: In([EstadoTurno.PENDIENTE, EstadoTurno.CERRADO]),
        fecha: Between(ahora, fechaLimite),
      },
    });

    // 3. Bloques personales de disponibilidad del paciente
    const bloques = await this.disponibilidadService.listarPorPaciente(pacienteId);

    const slotsDisponibles: OpcionTurnoCruzado[] = [];

    const DIAS_NOMBRE = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const MESES_NOMBRE = [
      'enero',
      'febrero',
      'marzo',
      'abril',
      'mayo',
      'junio',
      'julio',
      'agosto',
      'septiembre',
      'octubre',
      'noviembre',
      'diciembre',
    ];

    // Iterar por días hábiles dentro del rango
    for (let d = 0; d <= diasAdelante; d++) {
      const diaActual = new Date(ahora);
      diaActual.setDate(diaActual.getDate() + d);

      const diaSemanaNum = diaActual.getDay();
      // Solo días laborales lunes a viernes (1 a 5)
      if (diaSemanaNum === 0 || diaSemanaNum === 6) continue;

      const anio = diaActual.getFullYear();
      const mes = diaActual.getMonth();
      const dia = diaActual.getDate();

      // Horario hospitalario: de 08:30 a 17:30 en bloques de 30 min
      for (let hora = 8; hora < 18; hora++) {
        for (const minuto of [0, 30]) {
          const slotInicio = new Date(anio, mes, dia, hora, minuto, 0, 0);
          const slotFin = new Date(slotInicio.getTime() + 30 * 60 * 1000);

          // Saltear si el horario ya pasó o está a menos de 2 horas
          if (slotInicio.getTime() <= ahora.getTime() + 2 * 60 * 60 * 1000) {
            continue;
          }

          // A) Verificar conflicto con agenda del médico
          const colisionMedico = turnosMedico.some((t) => {
            const tInicio = new Date(t.fecha).getTime();
            const tFin = tInicio + 30 * 60 * 1000;
            return slotInicio.getTime() < tFin && slotFin.getTime() > tInicio;
          });
          if (colisionMedico) continue;

          // B) Verificar conflicto con turnos previos del paciente
          const colisionPacienteTurno = turnosPaciente.some((t) => {
            const tInicio = new Date(t.fecha).getTime();
            const tFin = tInicio + 30 * 60 * 1000;
            return slotInicio.getTime() < tFin && slotFin.getTime() > tInicio;
          });
          if (colisionPacienteTurno) continue;

          // C) Verificar conflicto con bloques personales del paciente
          const horaMinStr = `${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`;
          const minutoFin = minuto === 0 ? 30 : 0;
          const horaFinSlot = minuto === 0 ? hora : hora + 1;
          const horaFinMinStr = `${String(horaFinSlot).padStart(2, '0')}:${String(minutoFin).padStart(2, '0')}`;
          const fechaYMD = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;

          const colisionBloque = bloques.some((b) => {
            if (b.esRecurrente) {
              if (b.diaSemana !== diaSemanaNum) return false;
            } else {
              if (b.fechaPuntual !== fechaYMD) return false;
            }
            return horaMinStr < b.horaFin && horaFinMinStr > b.horaInicio;
          });
          if (colisionBloque) continue;

          // Slot 100% libre para ambas partes
          const diaNombre = DIAS_NOMBRE[diaSemanaNum];
          const mesNombre = MESES_NOMBRE[mes];
          const fechaFormateada = `${diaNombre} ${dia} de ${mesNombre}, ${horaMinStr} hs`;

          slotsDisponibles.push({
            fecha: slotInicio.toISOString(),
            fechaFormateada,
            diaSemana: diaNombre,
            hora: `${horaMinStr} hs`,
          });

          // Con 2 opciones es el número ideal solicitado
          if (slotsDisponibles.length >= 2) {
            return {
              opciones: slotsDisponibles,
              mensaje: null,
            };
          }
        }
      }
    }

    return {
      opciones: slotsDisponibles,
      mensaje:
        slotsDisponibles.length === 0
          ? 'No se encontraron huecos libres en común dentro de los próximos 15 días. Podés utilizar el agendamiento manual como respaldo.'
          : null,
    };
  }

  async listar(usuario: Usuario) {
    const query = this.repo
      .createQueryBuilder('turno')
      .leftJoinAndSelect('turno.paciente', 'paciente')
      .leftJoinAndSelect('turno.medico', 'medico')
      .orderBy('turno.fecha', 'DESC');

    if (usuario.rol === Rol.PACIENTE) {
      query.where('turno.pacienteId = :id', { id: usuario.id });
    } else if (usuario.rol === Rol.MEDICO) {
      query.where('turno.medicoId = :id', { id: usuario.id });
    } else if (usuario.rol !== Rol.DIRECTOR && usuario.rol !== Rol.AUDITOR) {
      return [];
    }

    return query.getMany();
  }

  async buscarPorId(id: string, usuario: Usuario) {
    const turno = await this.repo.findOne({
      where: { id },
      relations: ['paciente', 'medico'],
    });
    if (!turno) throw new NotFoundException(`Turno ${id} no encontrado`);

    const esParte = turno.pacienteId === usuario.id || turno.medicoId === usuario.id;
    const esSupervisor = usuario.rol === Rol.DIRECTOR || usuario.rol === Rol.AUDITOR;
    if (!esParte && !esSupervisor) {
      throw new ForbiddenException('No tenés acceso a este turno');
    }

    return turno;
  }

  async cancelar(id: string, usuario: Usuario) {
    const turno = await this.repo.findOne({
      where: { id },
      relations: ['paciente', 'medico'],
    });
    if (!turno) throw new NotFoundException(`Turno ${id} no encontrado`);

    const esParte = turno.pacienteId === usuario.id || turno.medicoId === usuario.id;
    if (!esParte && usuario.rol !== Rol.DIRECTOR) {
      throw new ForbiddenException('No podés cancelar este turno');
    }
    if (turno.estado !== EstadoTurno.PENDIENTE) {
      throw new BadRequestException('Solo se puede cancelar un turno pendiente');
    }

    turno.estado = EstadoTurno.CANCELADO;
    return this.repo.save(turno);
  }

  async cerrar(
    medico: Usuario,
    id: string,
    params: { diagnostico: string; obraSocialLiquidacionId: string | null },
  ) {
    const turno = await this.buscarPorId(id, medico);
    if (turno.estado !== EstadoTurno.PENDIENTE) {
      throw new BadRequestException('Solo se puede cerrar un turno pendiente');
    }

    turno.estado = EstadoTurno.CERRADO;
    turno.diagnosticoCierre = params.diagnostico;
    turno.obraSocialLiquidacionId = params.obraSocialLiquidacionId;
    turno.estadoLiquidacion = params.obraSocialLiquidacionId
      ? EstadoLiquidacion.PENDIENTE
      : EstadoLiquidacion.NO_APLICA;

    return this.repo.save(turno);
  }

  async existeVinculo(medicoId: string, pacienteId: string): Promise<boolean> {
    const cantidad = await this.repo.count({ where: { medicoId, pacienteId } });
    return cantidad > 0;
  }
}
