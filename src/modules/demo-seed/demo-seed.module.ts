import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TranscripcionConsulta } from '../ambient-ai/entities/transcripcion-consulta.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
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
    ]),
  ],
  providers: [DemoSeedService],
  exports: [DemoSeedService],
})
export class DemoSeedModule {}
