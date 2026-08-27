import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
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

  @Get('disponibilidad-cruzada')
  @Roles(Rol.MEDICO, Rol.PACIENTE)
  @ApiOperation({
    summary:
      'Cruza la agenda del médico con los turnos y bloques personales del paciente para sugerir 1 o 2 opciones de turno',
  })
  disponibilidadCruzada(
    @Query('medicoId') medicoId: string,
    @Query('pacienteId') pacienteId: string,
    @UsuarioActual() usuario: Usuario,
  ) {
    const medId = usuario.rol === Rol.MEDICO ? usuario.id : medicoId;
    const pacId = usuario.rol === Rol.PACIENTE ? usuario.id : pacienteId;

    if (!medId || !pacId) {
      throw new BadRequestException('Se requieren médico y paciente para calcular la disponibilidad cruzada');
    }

    return this.service.obtenerDisponibilidadCruzada(medId, pacId);
  }

  @Post()
  @Roles(Rol.PACIENTE, Rol.MEDICO)
  @ApiOperation({ summary: 'Reservar un turno (paciente o médico para su paciente)' })
  crear(@UsuarioActual() usuario: Usuario, @Body() dto: CreateAppointmentDto) {
    return this.service.crear(usuario, dto);
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
