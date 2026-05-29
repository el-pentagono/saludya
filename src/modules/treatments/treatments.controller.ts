import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TreatmentsService } from './treatments.service';
@ApiTags('treatments')
@Controller('api/treatments')
export class TreatmentsController { constructor(private readonly service: TreatmentsService) {} }
