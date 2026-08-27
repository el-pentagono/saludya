import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('menores_a_cargo')
export class MenorACargo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tutorId: string;

  @ManyToOne(() => Usuario, { eager: false })
  @JoinColumn({ name: 'tutorId' })
  tutor: Usuario;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 100 })
  apellido: string;

  @Column({ length: 20 })
  dni: string;

  /** Fecha de nacimiento en formato YYYY-MM-DD */
  @Column({ type: 'date' })
  fechaNacimiento: string;

  /** Relación o vínculo parental: madre | padre | tutor_legal | otro */
  @Column({ default: 'madre' })
  relacion: string;

  @Column({ nullable: true, length: 10 })
  grupoSanguineo: string;

  @Column({ type: 'text', nullable: true })
  alergias: string;

  @Column({ type: 'text', nullable: true })
  antecedentes: string;

  @Column({ nullable: true, length: 150 })
  pediatraCabecera: string;

  /** Documento de respaldo adjunto (Data URI o URL) */
  @Column({ type: 'text', nullable: true })
  documentoRespaldoUrl: string;

  @Column({ nullable: true, length: 255 })
  documentoRespaldoNombre: string;

  @Column({ nullable: true, length: 50 })
  documentoRespaldoTipo: string;

  @Column({ default: 'declarado' })
  estadoVerificacion: string;

  @CreateDateColumn()
  fechaCreacion: Date;

  @UpdateDateColumn()
  fechaActualizacion: Date;
}
