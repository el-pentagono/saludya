import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { UsuarioActual } from '../../common/decorators/usuario-actual.decorator';
import { Rol } from '../../common/enums/rol.enum';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { MedicalRecordsService } from './medical-records.service';

@ApiTags('medical-records')
@ApiBearerAuth()
@UseGuards(JwtGuard, RolesGuard)
@Controller('api/medical-records')
export class MedicalRecordsController {
  constructor(private readonly service: MedicalRecordsService) {}

  @Post()
  @Roles(Rol.MEDICO)
  @ApiOperation({ summary: 'Agregar una entrada a la historia clínica de un paciente' })
  crear(@UsuarioActual() medico: Usuario, @Body() dto: CreateMedicalRecordDto) {
    return this.service.crear(medico, dto);
  }

  @Get()
  @Roles(Rol.DIRECTOR, Rol.AUDITOR)
  @ApiOperation({ summary: 'Listar todas las entradas de historia clínica del sistema' })
  listarTodas() {
    return this.service.listarTodas();
  }

  @Get('paciente/:pacienteId')
  @ApiOperation({ summary: 'Ver la historia clínica completa de un paciente' })
  historialDePaciente(
    @Param('pacienteId') pacienteId: string,
    @UsuarioActual() usuario: Usuario,
  ) {
    return this.service.historialDePaciente(pacienteId, usuario);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver una entrada puntual de la historia clínica' })
  buscarPorId(@Param('id') id: string, @UsuarioActual() usuario: Usuario) {
    return this.service.buscarPorId(id, usuario);
  }
}
