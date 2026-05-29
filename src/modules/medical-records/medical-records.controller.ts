import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MedicalRecordsService } from './medical-records.service';
@ApiTags('medical-records')
@Controller('api/medical-records')
export class MedicalRecordsController { constructor(private readonly service: MedicalRecordsService) {} }
