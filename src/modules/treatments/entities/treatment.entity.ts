import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EstadoTratamiento } from '../../../common/enums/estado-tratamiento.enum';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('treatments')
export class Treatment {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column() pacienteId: string;
  @ManyToOne(() => Usuario, { eager: false })
  @JoinColumn({ name: 'pacienteId' })
  paciente: Usuario;

  @Column() medicoId: string;
  @ManyToOne(() => Usuario, { eager: false })
  @JoinColumn({ name: 'medicoId' })
  medico: Usuario;

  @Column() medicamento: string;

  @Column() dosis: string;

  @Column({ nullable: true }) indicaciones: string;

  @Column({ type: 'enum', enum: EstadoTratamiento, default: EstadoTratamiento.PRESCRITO })
  estado: EstadoTratamiento;

  @Column({ nullable: true }) farmaceuticoId: string;
  @ManyToOne(() => Usuario, { eager: false, nullable: true })
  @JoinColumn({ name: 'farmaceuticoId' })
  farmaceutico: Usuario;

  @Column({ type: 'timestamp', nullable: true }) fechaDispensa: Date;

  @CreateDateColumn() fechaCreacion: Date;
  @UpdateDateColumn() fechaActualizacion: Date;
}
