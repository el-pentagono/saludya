import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { TreatmentFollowUp } from './entities/treatment-follow-up.entity';
import { Treatment } from './entities/treatment.entity';
import { TreatmentsController } from './treatments.controller';
import { TreatmentsService } from './treatments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Treatment, TreatmentFollowUp]),
    UsuariosModule,
    NotificationsModule,
  ],
  controllers: [TreatmentsController],
  providers: [TreatmentsService],
  exports: [TreatmentsService],
})
export class TreatmentsModule {}
