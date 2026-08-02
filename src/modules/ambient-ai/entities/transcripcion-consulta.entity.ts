import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { MedicalRecord } from '../../medical-records/entities/medical-record.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('transcripciones_consulta')
export class TranscripcionConsulta {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ unique: true }) appointmentId: string;
  @ManyToOne(() => Appointment, { eager: false })
  @JoinColumn({ name: 'appointmentId' })
  appointment: Appointment;

  @Column() medicoId: string;
  @ManyToOne(() => Usuario, { eager: false })
  @JoinColumn({ name: 'medicoId' })
  medico: Usuario;

  @Column() pacienteId: string;
  @ManyToOne(() => Usuario, { eager: false })
  @JoinColumn({ name: 'pacienteId' })
  paciente: Usuario;

  @Column({ type: 'text' }) transcripcionCruda: string;
  @Column({ type: 'text' }) resumen: string;
  @Column({ type: 'simple-array' }) puntosClave: string[];

  @Column({ nullable: true }) medicalRecordId: string;
  @ManyToOne(() => MedicalRecord, { eager: false, nullable: true })
  @JoinColumn({ name: 'medicalRecordId' })
  medicalRecord: MedicalRecord;

  @CreateDateColumn() fechaCreacion: Date;
  @Column({ type: 'timestamp', nullable: true }) fechaConfirmacion: Date;
}
