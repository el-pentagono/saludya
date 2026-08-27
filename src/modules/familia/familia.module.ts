import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from '../appointments/entities/appointment.entity';
import { ConsentimientoMenor } from './entities/consentimiento-menor.entity';
import { MenorACargo } from './entities/menor-a-cargo.entity';
import { FamiliaController } from './familia.controller';
import { FamiliaService } from './familia.service';

@Module({
  imports: [TypeOrmModule.forFeature([ConsentimientoMenor, MenorACargo, Appointment])],
  controllers: [FamiliaController],
  providers: [FamiliaService],
  exports: [FamiliaService],
})
export class FamiliaModule {}
