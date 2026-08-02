import { Module } from '@nestjs/common';
import { AppointmentsModule } from '../appointments/appointments.module';
import { DocumentsModule } from '../documents/documents.module';
import { MedicalRecordsModule } from '../medical-records/medical-records.module';
import { ObrasSocialesModule } from '../obras-sociales/obras-sociales.module';
import { CierreExpressController } from './cierre-express.controller';
import { CierreExpressService } from './cierre-express.service';

@Module({
  imports: [AppointmentsModule, DocumentsModule, ObrasSocialesModule, MedicalRecordsModule],
  controllers: [CierreExpressController],
  providers: [CierreExpressService],
})
export class CierreExpressModule {}
