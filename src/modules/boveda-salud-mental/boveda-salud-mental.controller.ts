import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { UsuarioActual } from '../../common/decorators/usuario-actual.decorator';
import { Rol } from '../../common/enums/rol.enum';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { BovedaSaludMentalService } from './boveda-salud-mental.service';
import { CreateRegistroSaludMentalDto } from './dto/create-registro-salud-mental.dto';

@ApiTags('boveda-salud-mental')
@ApiBearerAuth()
@UseGuards(JwtGuard, RolesGuard)
@Controller('api/boveda-salud-mental')
export class BovedaSaludMentalController {
  constructor(private readonly service: BovedaSaludMentalService) {}

  @Post()
  @Roles(Rol.MEDICO)
  @ApiOperation({ summary: 'Agregar una entrada a la bóveda de salud mental de un paciente' })
  crear(@UsuarioActual() medico: Usuario, @Body() dto: CreateRegistroSaludMentalDto) {
    return this.service.crear(medico, dto);
  }

  @Get()
  @ApiOperation({
    summary:
      'Listar entradas (paciente: propias; médico: solo las que escribió él; director/auditor: todas)',
  })
  listar(@UsuarioActual() usuario: Usuario) {
    return this.service.listar(usuario);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver una entrada por ID (sin delegación entre médicos)' })
  buscarPorId(@Param('id') id: string, @UsuarioActual() usuario: Usuario) {
    return this.service.buscarPorId(id, usuario);
  }
}
