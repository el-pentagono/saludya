import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from '../appointments/entities/appointment.entity';
import { MedicalRecord } from '../medical-records/entities/medical-record.entity';
import { Treatment } from '../treatments/entities/treatment.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, Appointment, Treatment, MedicalRecord])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
