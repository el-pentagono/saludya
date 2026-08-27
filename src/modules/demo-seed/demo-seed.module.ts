import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TranscripcionConsulta } from '../ambient-ai/entities/transcripcion-consulta.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { BloqueDisponibilidad } from '../disponibilidad/entities/bloque-disponibilidad.entity';
import { ConsentimientoMenor } from '../familia/entities/consentimiento-menor.entity';
import { MenorACargo } from '../familia/entities/menor-a-cargo.entity';
import { MedicalRecord } from '../medical-records/entities/medical-record.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { StudyOrder } from '../study-orders/entities/study-order.entity';
import { TreatmentFollowUp } from '../treatments/entities/treatment-follow-up.entity';
import { Treatment } from '../treatments/entities/treatment.entity';
import { TriajeCritico } from '../triaje-critico/entities/triaje-critico.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { DemoSeedService } from './demo-seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Usuario,
      Appointment,
      MedicalRecord,
      StudyOrder,
      Treatment,
      TreatmentFollowUp,
      TriajeCritico,
      Notification,
      TranscripcionConsulta,
      BloqueDisponibilidad,
      ConsentimientoMenor,
      MenorACargo,
    ]),
  ],
  providers: [DemoSeedService],
  exports: [DemoSeedService],
})
export class DemoSeedModule {}
