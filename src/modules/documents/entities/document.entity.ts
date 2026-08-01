import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TipoDocumento } from '../../../common/enums/tipo-documento.enum';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column() pacienteId: string;
  @ManyToOne(() => Usuario, { eager: false })
  @JoinColumn({ name: 'pacienteId' })
  paciente: Usuario;

  @Column({ type: 'enum', enum: TipoDocumento }) tipo: TipoDocumento;

  @Column({ nullable: true }) appointmentId: string;
  @Column({ nullable: true }) treatmentId: string;

  @Column() tramiteId: string;
  @Column() numeroConstancia: string;
  @Column() urlDescarga: string;

  @Column({ type: 'timestamp' }) fechaEmision: Date;

  @CreateDateColumn() fechaCreacion: Date;
}
