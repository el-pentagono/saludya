import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsModule } from '../appointments/appointments.module';
import { TreatmentsModule } from '../treatments/treatments.module';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { Document } from './entities/document.entity';
import { TRAMITEXPRESS_CLIENT } from './tramitexpress/tramitexpress-client.interface';
import { MockTramitExpressClient } from './tramitexpress/tramitexpress-client.mock';

@Module({
  imports: [TypeOrmModule.forFeature([Document]), AppointmentsModule, TreatmentsModule],
  controllers: [DocumentsController],
  providers: [
    DocumentsService,
    { provide: TRAMITEXPRESS_CLIENT, useClass: MockTramitExpressClient },
  ],
  exports: [DocumentsService],
})
export class DocumentsModule {}
