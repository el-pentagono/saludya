import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('obras_sociales')
export class ObraSocial {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) codigo: string;
  @Column({ unique: true }) nombre: string;
  @Column({ default: true }) activa: boolean;
  @CreateDateColumn() fechaAlta: Date;
}
