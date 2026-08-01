import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { UsuarioActual } from '../../common/decorators/usuario-actual.decorator';
import { Rol } from '../../common/enums/rol.enum';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { DocumentsService } from './documents.service';
import { GenerarCertificadoTratamientoDto } from './dto/generar-certificado-tratamiento.dto';
import { GenerarConstanciaAtencionDto } from './dto/generar-constancia-atencion.dto';

@ApiTags('documents')
@ApiBearerAuth()
@UseGuards(JwtGuard, RolesGuard)
@Controller('api/documents')
export class DocumentsController {
  constructor(private readonly service: DocumentsService) {}

  @Post('constancia-atencion')
  @Roles(Rol.PACIENTE)
  @ApiOperation({ summary: 'Generar constancia de atención de un turno propio' })
  generarConstanciaAtencion(
    @UsuarioActual() paciente: Usuario,
    @Body() dto: GenerarConstanciaAtencionDto,
  ) {
    return this.service.generarConstanciaAtencion(paciente, dto.appointmentId);
  }

  @Post('certificado-tratamiento')
  @Roles(Rol.PACIENTE)
  @ApiOperation({ summary: 'Generar certificado de un tratamiento propio' })
  generarCertificadoTratamiento(
    @UsuarioActual() paciente: Usuario,
    @Body() dto: GenerarCertificadoTratamientoDto,
  ) {
    return this.service.generarCertificadoTratamiento(paciente, dto.treatmentId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar documentos (según el rol del usuario autenticado)' })
  listar(@UsuarioActual() usuario: Usuario) {
    return this.service.listar(usuario);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver un documento por ID' })
  buscarPorId(@Param('id') id: string, @UsuarioActual() usuario: Usuario) {
    return this.service.buscarPorId(id, usuario);
  }
}
