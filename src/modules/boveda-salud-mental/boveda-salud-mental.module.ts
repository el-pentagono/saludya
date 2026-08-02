import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { BovedaSaludMentalController } from './boveda-salud-mental.controller';
import { BovedaSaludMentalService } from './boveda-salud-mental.service';
import { RegistroSaludMental } from './entities/registro-salud-mental.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RegistroSaludMental]), UsuariosModule],
  controllers: [BovedaSaludMentalController],
  providers: [BovedaSaludMentalService],
  exports: [BovedaSaludMentalService],
})
export class BovedaSaludMentalModule {}
