import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EstadoOrdenEstudio } from '../../../common/enums/estado-orden-estudio.enum';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('study_orders')
export class StudyOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  pacienteId: string;

  @ManyToOne(() => Usuario, { eager: false })
  @JoinColumn({ name: 'pacienteId' })
  paciente: Usuario;

  @Column()
  medicoId: string;

  @ManyToOne(() => Usuario, { eager: false })
  @JoinColumn({ name: 'medicoId' })
  medico: Usuario;

  @Column({ nullable: true })
  appointmentId: string;

  @ManyToOne(() => Appointment, { eager: false, nullable: true })
  @JoinColumn({ name: 'appointmentId' })
  appointment: Appointment;

  @Column()
  tipoEstudio: string;

  @Column()
  lugar: string;

  @Column({ type: 'timestamp' })
  fechaSugerida: Date;

  @Column({ type: 'text', nullable: true })
  indicaciones: string;

  @Column({
    type: 'enum',
    enum: EstadoOrdenEstudio,
    default: EstadoOrdenEstudio.PENDIENTE,
  })
  estado: EstadoOrdenEstudio;

  @Column({ type: 'timestamp', nullable: true })
  fechaRealizado: Date;

  @Column({ type: 'timestamp', nullable: true })
  fechaControlSugerida: Date;

  @CreateDateColumn()
  fechaCreacion: Date;

  @UpdateDateColumn()
  fechaActualizacion: Date;
}
