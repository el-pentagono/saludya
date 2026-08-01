import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { UsuarioActual } from '../../common/decorators/usuario-actual.decorator';
import { Rol } from '../../common/enums/rol.enum';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@ApiTags('appointments')
@ApiBearerAuth()
@UseGuards(JwtGuard, RolesGuard)
@Controller('api/appointments')
export class AppointmentsController {
  constructor(private readonly service: AppointmentsService) {}

  @Post()
  @Roles(Rol.PACIENTE)
  @ApiOperation({ summary: 'Reservar un turno con un médico' })
  crear(@UsuarioActual() paciente: Usuario, @Body() dto: CreateAppointmentDto) {
    return this.service.crear(paciente, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar turnos (según el rol del usuario autenticado)' })
  listar(@UsuarioActual() usuario: Usuario) {
    return this.service.listar(usuario);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver un turno por ID' })
  buscarPorId(@Param('id') id: string, @UsuarioActual() usuario: Usuario) {
    return this.service.buscarPorId(id, usuario);
  }

  @Patch(':id/cancelar')
  @ApiOperation({ summary: 'Cancelar un turno' })
  cancelar(@Param('id') id: string, @UsuarioActual() usuario: Usuario) {
    return this.service.cancelar(id, usuario);
  }
}
