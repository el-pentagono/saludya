import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Treatment } from './treatment.entity';

@Entity('treatment_follow_ups')
export class TreatmentFollowUp {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column() treatmentId: string;
  @ManyToOne(() => Treatment, { eager: false })
  @JoinColumn({ name: 'treatmentId' })
  treatment: Treatment;

  @Column() enfermeroId: string;
  @ManyToOne(() => Usuario, { eager: false })
  @JoinColumn({ name: 'enfermeroId' })
  enfermero: Usuario;

  @Column({ type: 'text' }) nota: string;

  @CreateDateColumn() fecha: Date;
}
