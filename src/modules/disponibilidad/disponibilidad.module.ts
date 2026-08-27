import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DisponibilidadController } from './disponibilidad.controller';
import { DisponibilidadService } from './disponibilidad.service';
import { BloqueDisponibilidad } from './entities/bloque-disponibilidad.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BloqueDisponibilidad])],
  controllers: [DisponibilidadController],
  providers: [DisponibilidadService],
  exports: [DisponibilidadService],
})
export class DisponibilidadModule {}
