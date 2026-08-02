import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsModule } from '../appointments/appointments.module';
import { MedicalRecordsModule } from '../medical-records/medical-records.module';
import { AmbientAiController } from './ambient-ai.controller';
import { AmbientAiService } from './ambient-ai.service';
import { AMBIENT_AI_CLIENT } from './ambient-ai-client/ambient-ai-client.interface';
import { MockAmbientAiClient } from './ambient-ai-client/ambient-ai-client.mock';
import { TranscripcionConsulta } from './entities/transcripcion-consulta.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TranscripcionConsulta]),
    AppointmentsModule,
    MedicalRecordsModule,
  ],
  controllers: [AmbientAiController],
  providers: [AmbientAiService, { provide: AMBIENT_AI_CLIENT, useClass: MockAmbientAiClient }],
  exports: [AmbientAiService],
})
export class AmbientAiModule {}
