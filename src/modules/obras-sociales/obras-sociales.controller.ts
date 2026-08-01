import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ValidarAfiliadoDto } from './dto/validar-afiliado.dto';
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

  @Post(':id/validar-afiliado')
  @ApiOperation({ summary: 'Validar número de afiliado y DNI contra el padrón de la obra social' })
  validarAfiliado(@Param('id') id: string, @Body() dto: ValidarAfiliadoDto) {
    return this.service.validarAfiliado(id, dto);
  }
}
