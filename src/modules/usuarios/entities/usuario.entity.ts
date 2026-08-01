import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Rol } from '../../../common/enums/rol.enum';
import { ObraSocial } from '../../obras-sociales/entities/obra-social.entity';
@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) email: string;
  @Column() @Exclude() password: string;
  @Column() nombre: string;
  @Column() apellido: string;
  @Column({ unique: true }) dni: string;
  @Column({ nullable: true }) telefono: string;
  @Column({ type: 'enum', enum: Rol, default: Rol.PACIENTE }) rol: Rol;
  @Column({ default: true }) activo: boolean;
  @Column({ nullable: true }) shieldaiVerificacionId: string;
  @Column({ default: false }) identidadVerificada: boolean;
  @Column({ nullable: true }) obraSocialId?: string;
  @ManyToOne(() => ObraSocial, { nullable: true, eager: false })
  @JoinColumn({ name: 'obraSocialId' })
  obraSocial?: ObraSocial;
  @Column({ nullable: true }) numeroAfiliado?: string;
  @Column({ default: false }) afiliacionVerificada: boolean;
  @CreateDateColumn() fechaRegistro: Date;
  @UpdateDateColumn() fechaActualizacion: Date;
}
