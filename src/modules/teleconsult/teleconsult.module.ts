import { Module } from '@nestjs/common';
import { TeleconsultController } from './teleconsult.controller';
import { TeleconsultService } from './teleconsult.service';
@Module({ controllers: [TeleconsultController], providers: [TeleconsultService], exports: [TeleconsultService] })
export class TeleconsultModule {}
