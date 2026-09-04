import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Una dosis del Calendario Nacional de Vacunación (Argentina). Es catálogo de
 * referencia, no datos de un paciente: se siembra una vez y rara vez cambia.
 */
@Entity('catalogo_vacunas')
export class CatalogoVacuna {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Clave estable para el seed (no se muestra al usuario) */
  @Column({ unique: true })
  codigo: string;

  @Column()
  nombre: string;

  /** Ej: "Dosis única", "1ra dosis", "2do refuerzo" */
  @Column()
  dosis: string;

  /** Edad objetivo de aplicación, en días desde el nacimiento */
  @Column()
  edadObjetivoDias: number;

  /** Días de anticipación con los que se dispara la alerta de "próxima dosis" */
  @Column({ default: 15 })
  ventanaAlertaDias: number;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  /** Orden de presentación dentro de la libreta */
  @Column({ default: 0 })
  orden: number;

  @CreateDateColumn()
  fechaCreacion: Date;
}
