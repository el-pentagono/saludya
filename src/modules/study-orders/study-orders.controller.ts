import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { UsuarioActual } from '../../common/decorators/usuario-actual.decorator';
import { Rol } from '../../common/enums/rol.enum';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { CreateStudyOrderDto } from './dto/create-study-order.dto';
import { RealizarStudyOrderDto } from './dto/realizar-study-order.dto';
import { StudyOrdersService } from './study-orders.service';

@ApiTags('study-orders')
@ApiBearerAuth()
@UseGuards(JwtGuard, RolesGuard)
@Controller('api/study-orders')
export class StudyOrdersController {
  constructor(private readonly service: StudyOrdersService) {}

  @Post()
  @Roles(Rol.MEDICO)
  @ApiOperation({ summary: 'Emitir una orden de estudio médico para un paciente' })
  crear(@UsuarioActual() medico: Usuario, @Body() dto: CreateStudyOrderDto) {
    return this.service.crear(medico, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar órdenes de estudio (según el rol del usuario autenticado)' })
  listar(@UsuarioActual() usuario: Usuario) {
    return this.service.listar(usuario);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver una orden de estudio por ID' })
  buscarPorId(@Param('id') id: string, @UsuarioActual() usuario: Usuario) {
    return this.service.buscarPorId(id, usuario);
  }

  @Patch(':id/realizar')
  @Roles(Rol.MEDICO, Rol.DIRECTOR, Rol.AUDITOR)
  @ApiOperation({ summary: 'Marcar un estudio como realizado y sugerir fecha de control' })
  marcarRealizado(
    @Param('id') id: string,
    @UsuarioActual() medico: Usuario,
    @Body() dto: RealizarStudyOrderDto,
  ) {
    return this.service.marcarRealizado(medico, id, dto);
  }
}
