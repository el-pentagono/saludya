import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { Rol } from '../../common/enums/rol.enum';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminService } from './admin.service';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtGuard, RolesGuard)
@Roles(Rol.DIRECTOR, Rol.AUDITOR)
@Controller('api/admin')
export class AdminController {
  constructor(private readonly service: AdminService) {}

  @Get('resumen')
  @ApiOperation({ summary: 'Resumen agregado del sistema: usuarios, turnos, tratamientos e historias clínicas' })
  resumen() {
    return this.service.resumen();
  }
}
