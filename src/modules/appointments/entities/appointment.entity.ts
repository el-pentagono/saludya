import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EstadoTurno } from '../../../common/enums/estado-turno.enum';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column() pacienteId: string;
  @ManyToOne(() => Usuario, { eager: false })
  @JoinColumn({ name: 'pacienteId' })
  paciente: Usuario;

  @Column() medicoId: string;
  @ManyToOne(() => Usuario, { eager: false })
  @JoinColumn({ name: 'medicoId' })
  medico: Usuario;

  @Column({ type: 'timestamp' }) fecha: Date;

  @Column({ nullable: true }) motivo: string;

  @Column({ type: 'enum', enum: EstadoTurno, default: EstadoTurno.PENDIENTE })
  estado: EstadoTurno;

  @CreateDateColumn() fechaCreacion: Date;
  @UpdateDateColumn() fechaActualizacion: Date;
}
