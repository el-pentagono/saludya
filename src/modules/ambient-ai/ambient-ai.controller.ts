import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { UsuarioActual } from '../../common/decorators/usuario-actual.decorator';
import { Rol } from '../../common/enums/rol.enum';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { AmbientAiService } from './ambient-ai.service';
import { ConfirmarTranscripcionDto } from './dto/confirmar-transcripcion.dto';
import { CreateTranscripcionDto } from './dto/create-transcripcion.dto';

@ApiTags('ambient-ai')
@ApiBearerAuth()
@UseGuards(JwtGuard, RolesGuard)
@Controller('api/ambient-ai/transcripciones')
export class AmbientAiController {
  constructor(private readonly service: AmbientAiService) {}

  @Post()
  @Roles(Rol.MEDICO)
  @ApiOperation({ summary: 'Generar transcripción/resumen ambiental de un turno propio' })
  crear(@UsuarioActual() medico: Usuario, @Body() dto: CreateTranscripcionDto) {
    return this.service.crear(medico, dto);
  }

  @Patch(':id/confirmar')
  @Roles(Rol.MEDICO)
  @ApiOperation({ summary: 'Confirmar la transcripción y generar la entrada en historia clínica' })
  confirmar(
    @Param('id') id: string,
    @UsuarioActual() medico: Usuario,
    @Body() dto: ConfirmarTranscripcionDto,
  ) {
    return this.service.confirmar(medico, id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar transcripciones (médico: propias; director/auditor: todas)' })
  listar(@UsuarioActual() usuario: Usuario) {
    return this.service.listar(usuario);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver una transcripción por ID (borrador, sin acceso del paciente)' })
  buscarPorId(@Param('id') id: string, @UsuarioActual() usuario: Usuario) {
    return this.service.buscarPorId(id, usuario);
  }
}
