import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsModule } from '../appointments/appointments.module';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { TriajeCritico } from './entities/triaje-critico.entity';
import { TriajeCriticoController } from './triaje-critico.controller';
import { TriajeCriticoService } from './triaje-critico.service';

@Module({
  imports: [TypeOrmModule.forFeature([TriajeCritico]), UsuariosModule, AppointmentsModule],
  controllers: [TriajeCriticoController],
  providers: [TriajeCriticoService],
  exports: [TriajeCriticoService],
})
export class TriajeCriticoModule {}
