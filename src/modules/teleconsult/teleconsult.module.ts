import { Module } from '@nestjs/common';
import { AppointmentsModule } from '../appointments/appointments.module';
import { TeleconsultController } from './teleconsult.controller';
import { TeleconsultService } from './teleconsult.service';

@Module({
  imports: [AppointmentsModule],
  controllers: [TeleconsultController],
  providers: [TeleconsultService],
  exports: [TeleconsultService],
})
export class TeleconsultModule {}
