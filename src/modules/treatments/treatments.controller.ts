import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { UsuarioActual } from '../../common/decorators/usuario-actual.decorator';
import { Rol } from '../../common/enums/rol.enum';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { CreateFollowUpDto } from './dto/create-follow-up.dto';
import { CreateTreatmentDto } from './dto/create-treatment.dto';
import { TreatmentsService } from './treatments.service';

@ApiTags('treatments')
@ApiBearerAuth()
@UseGuards(JwtGuard, RolesGuard)
@Controller('api/treatments')
export class TreatmentsController {
  constructor(private readonly service: TreatmentsService) {}

  @Post()
  @Roles(Rol.MEDICO)
  @ApiOperation({ summary: 'Prescribir un tratamiento a un paciente' })
  prescribir(@UsuarioActual() medico: Usuario, @Body() dto: CreateTreatmentDto) {
    return this.service.prescribir(medico, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar tratamientos (según el rol del usuario autenticado)' })
  listar(@UsuarioActual() usuario: Usuario) {
    return this.service.listar(usuario);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver un tratamiento por ID' })
  buscarPorId(@Param('id') id: string, @UsuarioActual() usuario: Usuario) {
    return this.service.buscarPorId(id, usuario);
  }

  @Patch(':id/dispensar')
  @Roles(Rol.FARMACEUTICO)
  @ApiOperation({ summary: 'Dispensar un tratamiento' })
  dispensar(@Param('id') id: string, @UsuarioActual() farmaceutico: Usuario) {
    return this.service.dispensar(farmaceutico, id);
  }

  @Post(':id/seguimientos')
  @Roles(Rol.ENFERMERO)
  @ApiOperation({ summary: 'Agregar una nota de seguimiento al tratamiento' })
  agregarSeguimiento(
    @Param('id') id: string,
    @UsuarioActual() enfermero: Usuario,
    @Body() dto: CreateFollowUpDto,
  ) {
    return this.service.agregarSeguimiento(enfermero, id, dto);
  }

  @Get(':id/seguimientos')
  @ApiOperation({ summary: 'Listar el seguimiento de un tratamiento' })
  listarSeguimientos(@Param('id') id: string, @UsuarioActual() usuario: Usuario) {
    return this.service.listarSeguimientos(id, usuario);
  }
}
