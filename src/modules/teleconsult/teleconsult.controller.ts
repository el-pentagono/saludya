import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsuarioActual } from '../../common/decorators/usuario-actual.decorator';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { TeleconsultService } from './teleconsult.service';

@ApiTags('teleconsult')
@ApiBearerAuth()
@UseGuards(JwtGuard, RolesGuard)
@Controller('api/teleconsult')
export class TeleconsultController {
  constructor(private readonly service: TeleconsultService) {}

  @Get('turno/:appointmentId/sala')
  @ApiOperation({
    summary: 'Obtener la sala de videollamada de un turno (paciente/médico del turno, o director/auditor)',
  })
  obtenerSala(@Param('appointmentId') appointmentId: string, @UsuarioActual() usuario: Usuario) {
    return this.service.obtenerSala(appointmentId, usuario);
  }
}
