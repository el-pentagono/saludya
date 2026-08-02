import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EstadoTriaje } from '../../../common/enums/estado-triaje.enum';
import { PrioridadTriaje } from '../../../common/enums/prioridad-triaje.enum';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('triaje_criticos')
export class TriajeCritico {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column() pacienteId: string;
  @ManyToOne(() => Usuario, { eager: false })
  @JoinColumn({ name: 'pacienteId' })
  paciente: Usuario;

  @Column() evaluadorId: string;
  @ManyToOne(() => Usuario, { eager: false })
  @JoinColumn({ name: 'evaluadorId' })
  evaluador: Usuario;

  @Column({ type: 'text' }) observaciones: string;

  @Column({ type: 'enum', enum: PrioridadTriaje }) prioridad: PrioridadTriaje;

  @Column({ type: 'enum', enum: EstadoTriaje, default: EstadoTriaje.EN_ESPERA })
  estado: EstadoTriaje;

  @Column({ nullable: true }) medicoAsignadoId: string;
  @ManyToOne(() => Usuario, { eager: false, nullable: true })
  @JoinColumn({ name: 'medicoAsignadoId' })
  medicoAsignado: Usuario;

  @Column({ nullable: true }) appointmentId: string;
  @ManyToOne(() => Appointment, { eager: false, nullable: true })
  @JoinColumn({ name: 'appointmentId' })
  appointment: Appointment;

  @CreateDateColumn() fechaCreacion: Date;
  @Column({ type: 'timestamp', nullable: true }) fechaAsignacion: Date;
}
