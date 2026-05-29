import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TeleconsultService } from './teleconsult.service';
@ApiTags('teleconsult')
@Controller('api/teleconsult')
export class TeleconsultController { constructor(private readonly service: TeleconsultService) {} }
