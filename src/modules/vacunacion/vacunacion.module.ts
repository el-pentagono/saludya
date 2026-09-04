import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from '../appointments/entities/appointment.entity';
import { FamiliaModule } from '../familia/familia.module';
import { MenorACargo } from '../familia/entities/menor-a-cargo.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { AplicacionVacuna } from './entities/aplicacion-vacuna.entity';
import { CatalogoVacuna } from './entities/catalogo-vacuna.entity';
import { VacunacionController } from './vacunacion.controller';
import { VacunacionService } from './vacunacion.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CatalogoVacuna, AplicacionVacuna, MenorACargo, Appointment]),
    FamiliaModule,
    NotificationsModule,
  ],
  controllers: [VacunacionController],
  providers: [VacunacionService],
  exports: [VacunacionService],
})
export class VacunacionModule {}
