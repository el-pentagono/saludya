import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('consentimientos_menores')
export class ConsentimientoMenor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tutorId: string;

  @ManyToOne(() => Usuario, { eager: false })
  @JoinColumn({ name: 'tutorId' })
  tutor: Usuario;

  @Column({ default: '1.0' })
  versionPolitica: string;

  @Column({ type: 'text' })
  textoAceptado: string;

  @Column({ nullable: true })
  ipAddress: string;

  @CreateDateColumn()
  fechaAceptacion: Date;
}
