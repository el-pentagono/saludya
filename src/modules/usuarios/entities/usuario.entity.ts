import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Rol } from '../../../common/enums/rol.enum';
@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) email: string;
  @Column() @Exclude() password: string;
  @Column() nombre: string;
  @Column() apellido: string;
  @Column({ unique: true }) dni: string;
  @Column({ nullable: true }) telefono: string;
  @Column({ type: 'enum', enum: Rol, default: Rol.CIUDADANO }) rol: Rol;
  @Column({ default: true }) activo: boolean;
  @Column({ nullable: true }) shieldaiVerificacionId: string;
  @Column({ default: false }) identidadVerificada: boolean;
  @CreateDateColumn() fechaRegistro: Date;
  @UpdateDateColumn() fechaActualizacion: Date;
}
