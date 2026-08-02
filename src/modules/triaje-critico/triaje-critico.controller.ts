import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { UsuarioActual } from '../../common/decorators/usuario-actual.decorator';
import { Rol } from '../../common/enums/rol.enum';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { CreateTriajeDto } from './dto/create-triaje.dto';
import { TriajeCriticoService } from './triaje-critico.service';

@ApiTags('triaje')
@ApiBearerAuth()
@UseGuards(JwtGuard, RolesGuard)
@Controller('api/triaje')
export class TriajeCriticoController {
  constructor(private readonly service: TriajeCriticoService) {}

  @Post()
  @Roles(Rol.ENFERMERO, Rol.MEDICO)
  @ApiOperation({ summary: 'Cargar un caso de triaje crítico tras evaluar al paciente' })
  crear(@UsuarioActual() evaluador: Usuario, @Body() dto: CreateTriajeDto) {
    return this.service.crear(evaluador, dto);
  }

  @Patch(':id/asignar')
  @Roles(Rol.MEDICO)
  @ApiOperation({ summary: 'Tomar un caso de la cola de triaje (genera el turno vinculado)' })
  asignar(@Param('id') id: string, @UsuarioActual() medico: Usuario) {
    return this.service.asignar(medico, id);
  }

  @Patch(':id/atender')
  @Roles(Rol.MEDICO)
  @ApiOperation({ summary: 'Cerrar un caso de triaje (solo el médico asignado)' })
  atender(@Param('id') id: string, @UsuarioActual() medico: Usuario) {
    return this.service.atender(medico, id);
  }

  @Patch(':id/cancelar')
  @Roles(Rol.ENFERMERO, Rol.MEDICO)
  @ApiOperation({ summary: 'Cancelar un caso en espera' })
  cancelar(@Param('id') id: string) {
    return this.service.cancelar(id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar casos de triaje (según el rol del usuario autenticado)' })
  listar(@UsuarioActual() usuario: Usuario) {
    return this.service.listar(usuario);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver un caso de triaje por ID' })
  buscarPorId(@Param('id') id: string, @UsuarioActual() usuario: Usuario) {
    return this.service.buscarPorId(id, usuario);
  }
}
