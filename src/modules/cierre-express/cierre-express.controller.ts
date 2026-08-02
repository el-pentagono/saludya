import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { UsuarioActual } from '../../common/decorators/usuario-actual.decorator';
import { Rol } from '../../common/enums/rol.enum';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { CierreExpressService } from './cierre-express.service';
import { CierreExpressDto } from './dto/cierre-express.dto';

@ApiTags('cierre-express')
@ApiBearerAuth()
@UseGuards(JwtGuard, RolesGuard)
@Controller('api/cierre-express')
export class CierreExpressController {
  constructor(private readonly service: CierreExpressService) {}

  @Patch(':appointmentId')
  @Roles(Rol.MEDICO)
  @ApiOperation({
    summary:
      'Cerrar un turno en un solo paso: diagnóstico + constancia de atención + entrada en historia clínica + liquidación',
  })
  cerrar(
    @Param('appointmentId') appointmentId: string,
    @UsuarioActual() medico: Usuario,
    @Body() dto: CierreExpressDto,
  ) {
    return this.service.cerrarTurno(medico, appointmentId, dto);
  }
}
