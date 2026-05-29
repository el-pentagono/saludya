import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
@ApiTags('appointments')
@Controller('api/appointments')
export class AppointmentsController { constructor(private readonly service: AppointmentsService) {} }
