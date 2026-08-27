import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('bloques_disponibilidad')
export class BloqueDisponibilidad {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  pacienteId: string;

  @ManyToOne(() => Usuario, { eager: false })
  @JoinColumn({ name: 'pacienteId' })
  paciente: Usuario;

  @Column({ length: 150 })
  titulo: string;

  @Column({ default: true })
  esRecurrente: boolean;

  /**
   * Día de la semana (0 = Domingo, 1 = Lunes, 2 = Martes, 3 = Miércoles, 4 = Jueves, 5 = Viernes, 6 = Sábado).
   * Solo aplica si esRecurrente === true.
   */
  @Column({ type: 'int', nullable: true })
  diaSemana: number | null;

  /**
   * Fecha puntual en formato YYYY-MM-DD si esRecurrente === false.
   */
  @Column({ type: 'date', nullable: true })
  fechaPuntual: string | null;

  /**
   * Hora de inicio en formato HH:mm (ej. "09:00").
   */
  @Column({ length: 5 })
  horaInicio: string;

  /**
   * Hora de fin en formato HH:mm (ej. "12:00").
   */
  @Column({ length: 5 })
  horaFin: string;

  @CreateDateColumn()
  fechaCreacion: Date;
}
