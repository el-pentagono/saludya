import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EstadoAplicacionVacuna } from '../../../common/enums/estado-aplicacion-vacuna.enum';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { MenorACargo } from '../../familia/entities/menor-a-cargo.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { CatalogoVacuna } from './catalogo-vacuna.entity';

/**
 * Una fila de la Libreta Sanitaria Digital de un menor: una dosis puntual del
 * calendario, pendiente o ya aplicada. Se genera automáticamente para todo el
 * calendario apenas se consulta la libreta de un menor por primera vez.
 */
@Entity('aplicaciones_vacuna')
export class AplicacionVacuna {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  menorId: string;

  @ManyToOne(() => MenorACargo, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'menorId' })
  menor: MenorACargo;

  @Column()
  catalogoVacunaId: string;

  @ManyToOne(() => CatalogoVacuna, { eager: true })
  @JoinColumn({ name: 'catalogoVacunaId' })
  catalogoVacuna: CatalogoVacuna;

  /** Fecha en la que corresponde aplicar la dosis, en formato YYYY-MM-DD */
  @Column({ type: 'date' })
  fechaProgramada: string;

  @Column({ type: 'enum', enum: EstadoAplicacionVacuna, default: EstadoAplicacionVacuna.PENDIENTE })
  estado: EstadoAplicacionVacuna;

  @Column({ type: 'date', nullable: true })
  fechaAplicacion: string;

  @Column({ nullable: true })
  loteVacuna: string;

  @Column({ nullable: true })
  lugarAplicacion: string;

  @Column({ nullable: true })
  medicoAplicadorId: string;

  @ManyToOne(() => Usuario, { eager: false, nullable: true })
  @JoinColumn({ name: 'medicoAplicadorId' })
  medicoAplicador: Usuario;

  @Column({ type: 'text', nullable: true })
  notas: string;

  /** Turno agendado (por el tutor) para venir a aplicarse esta dosis, si ya existe */
  @Column({ nullable: true })
  appointmentId: string;

  @ManyToOne(() => Appointment, { eager: false, nullable: true })
  @JoinColumn({ name: 'appointmentId' })
  appointment: Appointment;

  /** Evita reenviar la misma alerta de "dosis próxima" todos los días */
  @Column({ default: false })
  alertaProximaEnviada: boolean;

  /** Evita reenviar la misma alerta de "dosis atrasada" todos los días */
  @Column({ default: false })
  alertaAtrasadaEnviada: boolean;

  @CreateDateColumn()
  fechaCreacion: Date;

  @UpdateDateColumn()
  fechaActualizacion: Date;
}
