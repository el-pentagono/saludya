import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Afiliado } from './entities/afiliado.entity';
import { ObraSocial } from './entities/obra-social.entity';
import { ObrasSocialesController } from './obras-sociales.controller';
import { ObrasSocialesService } from './obras-sociales.service';

@Module({
  imports: [TypeOrmModule.forFeature([ObraSocial, Afiliado])],
  controllers: [ObrasSocialesController],
  providers: [ObrasSocialesService],
  exports: [ObrasSocialesService],
})
export class ObrasSocialesModule {}
