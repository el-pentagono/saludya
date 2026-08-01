import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EstadoAfiliado } from '../../../common/enums/estado-afiliado.enum';
import { ObraSocial } from './obra-social.entity';

@Entity('afiliados')
@Index(['obraSocialId', 'numeroAfiliado'], { unique: true })
export class Afiliado {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column() obraSocialId: string;
  @ManyToOne(() => ObraSocial, { eager: false })
  @JoinColumn({ name: 'obraSocialId' })
  obraSocial: ObraSocial;

  @Column() numeroAfiliado: string;
  @Column() dni: string;
  @Column() nombreTitular: string;

  @Column({ type: 'enum', enum: EstadoAfiliado, default: EstadoAfiliado.ACTIVO })
  estado: EstadoAfiliado;

  @Column({ type: 'date', nullable: true }) vigenciaHasta: Date;
}
