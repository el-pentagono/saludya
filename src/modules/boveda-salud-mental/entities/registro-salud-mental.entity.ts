import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('registros_salud_mental')
export class RegistroSaludMental {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column() pacienteId: string;
  @ManyToOne(() => Usuario, { eager: false })
  @JoinColumn({ name: 'pacienteId' })
  paciente: Usuario;

  @Column() medicoId: string;
  @ManyToOne(() => Usuario, { eager: false })
  @JoinColumn({ name: 'medicoId' })
  medico: Usuario;

  @Column({ type: 'text' }) notasPrivadas: string;
  @Column({ type: 'text' }) resumenPaciente: string;

  @CreateDateColumn() fecha: Date;
}
