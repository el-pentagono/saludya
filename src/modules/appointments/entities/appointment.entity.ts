import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EstadoLiquidacion } from '../../../common/enums/estado-liquidacion.enum';
import { EstadoTurno } from '../../../common/enums/estado-turno.enum';
import { ObraSocial } from '../../obras-sociales/entities/obra-social.entity';
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

  @Column({ nullable: true }) menorId: string;

  @Column({ nullable: true }) motivo: string;

  @Column({ type: 'enum', enum: EstadoTurno, default: EstadoTurno.PENDIENTE })
  estado: EstadoTurno;

  @Column({ nullable: true }) diagnosticoCierre: string;

  @Column({ type: 'enum', enum: EstadoLiquidacion, default: EstadoLiquidacion.NO_APLICA })
  estadoLiquidacion: EstadoLiquidacion;

  @Column({ nullable: true }) obraSocialLiquidacionId: string;
  @ManyToOne(() => ObraSocial, { eager: false, nullable: true })
  @JoinColumn({ name: 'obraSocialLiquidacionId' })
  obraSocialLiquidacion: ObraSocial;

  @CreateDateColumn() fechaCreacion: Date;
  @UpdateDateColumn() fechaActualizacion: Date;
}
