import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ObrasSocialesService } from './obras-sociales.service';

@ApiTags('obras-sociales')
@Controller('api/obras-sociales')
export class ObrasSocialesController {
  constructor(private readonly service: ObrasSocialesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar obras sociales disponibles' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver obra social por ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
