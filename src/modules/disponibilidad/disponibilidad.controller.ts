import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { DisponibilidadService } from './disponibilidad.service';
import { CreateBloqueDto } from './dto/create-bloque.dto';

@ApiTags('disponibilidad')
@ApiBearerAuth()
@UseGuards(JwtGuard, RolesGuard)
@Controller('api/disponibilidad')
export class DisponibilidadController {
  constructor(private readonly service: DisponibilidadService) {}

  @Get('mis-bloques')
  @Roles(Rol.PACIENTE)
  @ApiOperation({ summary: 'Listar bloques de tiempo prioritario/ocupado del paciente autenticado' })
  listarMisBloques(@UsuarioActual() paciente: Usuario) {
    return this.service.listarPorPaciente(paciente.id);
  }

  @Post('mis-bloques')
  @Roles(Rol.PACIENTE)
  @ApiOperation({ summary: 'Agregar un nuevo bloque de tiempo prioritario u ocupado' })
  crear(@UsuarioActual() paciente: Usuario, @Body() dto: CreateBloqueDto) {
    return this.service.crear(paciente, dto);
  }

  @Delete('mis-bloques/:id')
  @Roles(Rol.PACIENTE)
  @ApiOperation({ summary: 'Eliminar un bloque de tiempo propio' })
  eliminar(@Param('id') id: string, @UsuarioActual() paciente: Usuario) {
    return this.service.eliminar(id, paciente);
  }
}
