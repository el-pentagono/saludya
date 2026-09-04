import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadoAplicacionVacuna } from '../../common/enums/estado-aplicacion-vacuna.enum';
import { Rol } from '../../common/enums/rol.enum';
import { Appointment } from '../appointments/entities/appointment.entity';
import { FamiliaService } from '../familia/familia.service';
import { MenorACargo } from '../familia/entities/menor-a-cargo.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { CALENDARIO_NACIONAL_VACUNACION } from './calendario-nacional.seed';
import { RegistrarAplicacionDto } from './dto/registrar-aplicacion.dto';
import { VincularTurnoDto } from './dto/vincular-turno.dto';
import { AplicacionVacuna } from './entities/aplicacion-vacuna.entity';
import { CatalogoVacuna } from './entities/catalogo-vacuna.entity';

export type UrgenciaVacuna = 'aplicada' | 'atrasada' | 'proxima' | 'pendiente';

export interface AplicacionVacunaConUrgencia extends AplicacionVacuna {
  urgencia: UrgenciaVacuna;
}

const MS_POR_DIA = 24 * 60 * 60 * 1000;
const ROLES_CLINICOS = [Rol.MEDICO, Rol.ENFERMERO, Rol.DIRECTOR, Rol.AUDITOR];

@Injectable()
export class VacunacionService implements OnModuleInit {
  private readonly logger = new Logger(VacunacionService.name);

  constructor(
    @InjectRepository(CatalogoVacuna)
    private readonly catalogoRepo: Repository<CatalogoVacuna>,
    @InjectRepository(AplicacionVacuna)
    private readonly aplicacionRepo: Repository<AplicacionVacuna>,
    @InjectRepository(MenorACargo)
    private readonly menorRepo: Repository<MenorACargo>,
    @InjectRepository(Appointment)
    private readonly appointmentsRepo: Repository<Appointment>,
    private readonly familiaService: FamiliaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async onModuleInit() {
    try {
      await this.sembrarCalendarioNacional();
    } catch (err) {
      this.logger.warn(`Error al sembrar el calendario nacional de vacunación: ${err.message}`);
    }
  }

  private async sembrarCalendarioNacional() {
    for (const dosis of CALENDARIO_NACIONAL_VACUNACION) {
      const existente = await this.catalogoRepo.findOne({ where: { codigo: dosis.codigo } });
      if (existente) continue;
      await this.catalogoRepo.save(this.catalogoRepo.create(dosis));
    }
  }

  private sumarDias(fechaISO: string, dias: number): string {
    const fecha = new Date(`${fechaISO}T00:00:00`);
    fecha.setDate(fecha.getDate() + dias);
    return fecha.toISOString().slice(0, 10);
  }

  private calcularUrgencia(aplicacion: AplicacionVacuna, hoy: Date): UrgenciaVacuna {
    if (aplicacion.estado === EstadoAplicacionVacuna.APLICADA) return 'aplicada';

    const objetivo = new Date(`${aplicacion.fechaProgramada}T00:00:00`);
    const ventanaDias = aplicacion.catalogoVacuna?.ventanaAlertaDias ?? 15;
    const diffDias = Math.round((objetivo.getTime() - hoy.getTime()) / MS_POR_DIA);

    if (diffDias < 0) return 'atrasada';
    if (diffDias <= ventanaDias) return 'proxima';
    return 'pendiente';
  }

  private conUrgencia(aplicaciones: AplicacionVacuna[]): AplicacionVacunaConUrgencia[] {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return aplicaciones.map((a) => ({ ...a, urgencia: this.calcularUrgencia(a, hoy) }));
  }

  async obtenerCatalogo(): Promise<CatalogoVacuna[]> {
    return this.catalogoRepo.find({ order: { orden: 'ASC' } });
  }

  /** Genera la libreta completa de un menor a partir del catálogo, si todavía no existe. */
  private async asegurarLibretaGenerada(menor: MenorACargo): Promise<void> {
    const cantidad = await this.aplicacionRepo.count({ where: { menorId: menor.id } });
    if (cantidad > 0) return;

    const catalogo = await this.obtenerCatalogo();
    const filas = catalogo.map((dosis) =>
      this.aplicacionRepo.create({
        menorId: menor.id,
        catalogoVacunaId: dosis.id,
        fechaProgramada: this.sumarDias(menor.fechaNacimiento, dosis.edadObjetivoDias),
        estado: EstadoAplicacionVacuna.PENDIENTE,
      }),
    );
    await this.aplicacionRepo.save(filas);
  }

  /** Resuelve el menor y valida que el usuario autenticado pueda ver su libreta. */
  private async resolverMenorConAcceso(menorId: string, usuario: Usuario): Promise<MenorACargo> {
    if (usuario.rol === Rol.PACIENTE) {
      return this.familiaService.obtenerMenor(menorId, usuario.id);
    }
    if (ROLES_CLINICOS.includes(usuario.rol)) {
      const menor = await this.menorRepo.findOne({ where: { id: menorId } });
      if (!menor) throw new NotFoundException(`Perfil de menor ${menorId} no encontrado`);
      return menor;
    }
    throw new ForbiddenException('No tenés permiso para ver esta libreta sanitaria');
  }

  async listarLibreta(menorId: string, usuario: Usuario): Promise<AplicacionVacunaConUrgencia[]> {
    const menor = await this.resolverMenorConAcceso(menorId, usuario);
    await this.asegurarLibretaGenerada(menor);

    const aplicaciones = await this.aplicacionRepo.find({
      where: { menorId },
      relations: ['catalogoVacuna', 'medicoAplicador'],
      order: { fechaProgramada: 'ASC' },
    });

    return this.conUrgencia(aplicaciones);
  }

  async buscarMenorPorDni(dni: string): Promise<MenorACargo> {
    const menor = await this.menorRepo.findOne({
      where: { dni },
      relations: ['tutor'],
    });
    if (!menor) {
      throw new NotFoundException(`No se encontró un menor a cargo con DNI ${dni}`);
    }
    return menor;
  }

  async registrarAplicacion(
    medico: Usuario,
    aplicacionId: string,
    dto: RegistrarAplicacionDto,
  ): Promise<AplicacionVacunaConUrgencia> {
    const aplicacion = await this.aplicacionRepo.findOne({
      where: { id: aplicacionId },
      relations: ['catalogoVacuna', 'menor'],
    });
    if (!aplicacion) {
      throw new NotFoundException(`Dosis ${aplicacionId} no encontrada en ninguna libreta`);
    }
    if (aplicacion.estado === EstadoAplicacionVacuna.APLICADA) {
      throw new BadRequestException('Esta dosis ya fue registrada como aplicada');
    }

    aplicacion.estado = EstadoAplicacionVacuna.APLICADA;
    aplicacion.fechaAplicacion = dto.fechaAplicacion || new Date().toISOString().slice(0, 10);
    aplicacion.loteVacuna = dto.loteVacuna || null;
    aplicacion.lugarAplicacion = dto.lugarAplicacion || null;
    aplicacion.notas = dto.notas || null;
    aplicacion.medicoAplicadorId = medico.id;

    const guardada = await this.aplicacionRepo.save(aplicacion);

    const menor = aplicacion.menor;
    const nombreMedico = `Dr/a. ${medico.nombre} ${medico.apellido}`;
    try {
      await this.notificationsService.crear(
        menor.tutorId,
        'Vacuna aplicada',
        `${nombreMedico} registró la aplicación de ${aplicacion.catalogoVacuna.nombre} (${aplicacion.catalogoVacuna.dosis}) a ${menor.nombre}.`,
        'vacuna_aplicada',
        { menorId: menor.id, menorNombre: menor.nombre, aplicacionId: guardada.id },
      );
    } catch {
      // No bloquear el registro clínico si falla la notificación
    }

    const [conUrgencia] = this.conUrgencia([guardada]);
    return conUrgencia;
  }

  async vincularTurno(
    tutor: Usuario,
    aplicacionId: string,
    dto: VincularTurnoDto,
  ): Promise<AplicacionVacunaConUrgencia> {
    const aplicacion = await this.aplicacionRepo.findOne({
      where: { id: aplicacionId },
      relations: ['catalogoVacuna', 'menor'],
    });
    if (!aplicacion) {
      throw new NotFoundException(`Dosis ${aplicacionId} no encontrada en ninguna libreta`);
    }
    if (aplicacion.menor.tutorId !== tutor.id) {
      throw new ForbiddenException('No tenés permiso sobre esta libreta sanitaria');
    }

    const turno = await this.appointmentsRepo.findOne({ where: { id: dto.appointmentId } });
    if (!turno) {
      throw new NotFoundException(`Turno ${dto.appointmentId} no encontrado`);
    }
    if (turno.pacienteId !== tutor.id || turno.menorId !== aplicacion.menorId) {
      throw new ForbiddenException('El turno indicado no corresponde a este menor');
    }

    aplicacion.appointmentId = turno.id;
    const guardada = await this.aplicacionRepo.save(aplicacion);
    const [conUrgencia] = this.conUrgencia([guardada]);
    return conUrgencia;
  }

  /**
   * Corre todos los días: avisa a los tutores cuando una dosis pendiente entra
   * en su ventana de alerta, o cuando queda atrasada. Cada aviso se envía una
   * sola vez por dosis (queda marcado en `alertaProximaEnviada` / `alertaAtrasadaEnviada`).
   */
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async verificarProximasDosis(): Promise<void> {
    const pendientes = await this.aplicacionRepo.find({
      where: { estado: EstadoAplicacionVacuna.PENDIENTE },
      relations: ['catalogoVacuna', 'menor'],
    });

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    for (const aplicacion of pendientes) {
      const urgencia = this.calcularUrgencia(aplicacion, hoy);

      if (urgencia === 'proxima' && !aplicacion.alertaProximaEnviada) {
        await this.notificarDosis(aplicacion, 'proxima');
        aplicacion.alertaProximaEnviada = true;
        await this.aplicacionRepo.save(aplicacion);
      } else if (urgencia === 'atrasada' && !aplicacion.alertaAtrasadaEnviada) {
        await this.notificarDosis(aplicacion, 'atrasada');
        aplicacion.alertaAtrasadaEnviada = true;
        await this.aplicacionRepo.save(aplicacion);
      }
    }
  }

  private async notificarDosis(
    aplicacion: AplicacionVacuna,
    urgencia: 'proxima' | 'atrasada',
  ): Promise<void> {
    const menor = aplicacion.menor;
    const vacuna = aplicacion.catalogoVacuna;
    const fechaFormateada = new Date(`${aplicacion.fechaProgramada}T00:00:00`).toLocaleDateString(
      'es-AR',
    );

    const titulo =
      urgencia === 'proxima'
        ? `Próxima dosis: ${vacuna.nombre}`
        : `Dosis atrasada: ${vacuna.nombre}`;
    const mensaje =
      urgencia === 'proxima'
        ? `${menor.nombre} tiene programada la dosis "${vacuna.dosis}" de ${vacuna.nombre} para el ${fechaFormateada}. Sacá el turno desde la Libreta Sanitaria.`
        : `${menor.nombre} tiene pendiente desde el ${fechaFormateada} la dosis "${vacuna.dosis}" de ${vacuna.nombre}. Te recomendamos agendar el turno cuanto antes.`;

    try {
      await this.notificationsService.crear(
        menor.tutorId,
        titulo,
        mensaje,
        urgencia === 'proxima' ? 'vacuna_proxima' : 'vacuna_atrasada',
        {
          menorId: menor.id,
          menorNombre: menor.nombre,
          aplicacionId: aplicacion.id,
          vacunaNombre: vacuna.nombre,
          vacunaDosis: vacuna.dosis,
          fechaProgramada: aplicacion.fechaProgramada,
        },
      );
    } catch (err) {
      this.logger.warn(`No se pudo notificar la dosis ${aplicacion.id}: ${err.message}`);
    }
  }
}
