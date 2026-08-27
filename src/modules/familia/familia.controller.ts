import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { UsuarioActual } from '../../common/decorators/usuario-actual.decorator';
import { Rol } from '../../common/enums/rol.enum';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { ActualizarSaludMenorDto } from './dto/actualizar-salud-menor.dto';
import { AdjuntarDocumentoMenorDto } from './dto/adjuntar-documento-menor.dto';
import { CrearConsentimientoDto } from './dto/crear-consentimiento.dto';
import { CrearMenorDto } from './dto/crear-menor.dto';
import { FamiliaService } from './familia.service';

@ApiTags('familia')
@ApiBearerAuth()
@UseGuards(JwtGuard, RolesGuard)
@Roles(Rol.PACIENTE)
@Controller('api/familia')
export class FamiliaController {
  constructor(private readonly service: FamiliaService) {}

  @Get('consentimiento')
  @ApiOperation({ summary: 'Consultar estado del consentimiento para tratamiento de datos de menores' })
  obtenerConsentimiento(@UsuarioActual() tutor: Usuario) {
    return this.service.obtenerConsentimiento(tutor.id);
  }

  @Post('consentimiento')
  @ApiOperation({ summary: 'Aceptar expresamente el consentimiento de tratamiento de datos de menores' })
  aceptarConsentimiento(@UsuarioActual() tutor: Usuario, @Body() dto: CrearConsentimientoDto) {
    return this.service.aceptarConsentimiento(tutor, dto);
  }

  @Get('menores')
  @ApiOperation({ summary: 'Listar los hijos y menores a cargo del paciente' })
  listarMenores(@UsuarioActual() tutor: Usuario) {
    return this.service.listarMenores(tutor.id);
  }

  @Post('menores')
  @ApiOperation({ summary: 'Registrar un nuevo menor a cargo (menor de 16 años)' })
  crearMenor(@UsuarioActual() tutor: Usuario, @Body() dto: CrearMenorDto) {
    return this.service.crearMenor(tutor, dto);
  }

  @Get('menores/:id')
  @ApiOperation({ summary: 'Obtener detalle y ficha de salud de un menor a cargo' })
  obtenerMenor(@Param('id') id: string, @UsuarioActual() tutor: Usuario) {
    return this.service.obtenerMenor(id, tutor.id);
  }

  @Patch('menores/:id')
  @ApiOperation({ summary: 'Actualizar datos de salud del menor (grupo sanguíneo, alergias, notas)' })
  actualizarSalud(
    @Param('id') id: string,
    @UsuarioActual() tutor: Usuario,
    @Body() dto: ActualizarSaludMenorDto,
  ) {
    return this.service.actualizarSaludMenor(id, tutor.id, dto);
  }

  @Post('menores/:id/documento')
  @ApiOperation({ summary: 'Adjuntar documento de respaldo (DNI o Partida de Nacimiento)' })
  adjuntarDocumento(
    @Param('id') id: string,
    @UsuarioActual() tutor: Usuario,
    @Body() dto: AdjuntarDocumentoMenorDto,
  ) {
    return this.service.adjuntarDocumento(id, tutor.id, dto);
  }

  @Delete('menores/:id')
  @ApiOperation({ summary: 'Eliminar un perfil de menor a cargo' })
  eliminarMenor(@Param('id') id: string, @UsuarioActual() tutor: Usuario) {
    return this.service.eliminarMenor(id, tutor);
  }

  @Get('menores/:id/turnos')
  @ApiOperation({ summary: 'Listar turnos médicos asociados al menor' })
  listarTurnosMenor(@Param('id') id: string, @UsuarioActual() tutor: Usuario) {
    return this.service.listarTurnosMenor(id, tutor.id);
  }
}
