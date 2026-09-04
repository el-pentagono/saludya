import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { UsuarioActual } from '../../common/decorators/usuario-actual.decorator';
import { Rol } from '../../common/enums/rol.enum';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { RegistrarAplicacionDto } from './dto/registrar-aplicacion.dto';
import { VincularTurnoDto } from './dto/vincular-turno.dto';
import { VacunacionService } from './vacunacion.service';

@ApiTags('vacunacion')
@ApiBearerAuth()
@UseGuards(JwtGuard, RolesGuard)
@Controller('api/vacunacion')
export class VacunacionController {
  constructor(private readonly service: VacunacionService) {}

  @Get('catalogo')
  @ApiOperation({ summary: 'Consultar el Calendario Nacional de Vacunación completo' })
  obtenerCatalogo() {
    return this.service.obtenerCatalogo();
  }

  @Get('menores/buscar')
  @Roles(Rol.MEDICO, Rol.ENFERMERO, Rol.DIRECTOR, Rol.AUDITOR)
  @ApiOperation({ summary: 'Buscar un menor a cargo por DNI (para registrar vacunas)' })
  buscarMenorPorDni(@Query('dni') dni: string) {
    return this.service.buscarMenorPorDni(dni);
  }

  @Get('menores/:menorId/libreta')
  @ApiOperation({
    summary: 'Ver la Libreta Sanitaria Digital de un menor (dosis aplicadas y pendientes)',
  })
  listarLibreta(@Param('menorId') menorId: string, @UsuarioActual() usuario: Usuario) {
    return this.service.listarLibreta(menorId, usuario);
  }

  @Post('aplicaciones/:id/registrar')
  @Roles(Rol.MEDICO)
  @ApiOperation({ summary: 'Registrar la aplicación de una dosis (pediatra)' })
  registrarAplicacion(
    @Param('id') id: string,
    @UsuarioActual() medico: Usuario,
    @Body() dto: RegistrarAplicacionDto,
  ) {
    return this.service.registrarAplicacion(medico, id, dto);
  }

  @Post('aplicaciones/:id/vincular-turno')
  @Roles(Rol.PACIENTE)
  @ApiOperation({ summary: 'Vincular un turno ya reservado a una dosis pendiente' })
  vincularTurno(
    @Param('id') id: string,
    @UsuarioActual() tutor: Usuario,
    @Body() dto: VincularTurnoDto,
  ) {
    return this.service.vincularTurno(tutor, id, dto);
  }
}
