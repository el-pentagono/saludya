import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsuarioActual } from '../../common/decorators/usuario-actual.decorator';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('api/notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar notificaciones del usuario autenticado' })
  listar(@UsuarioActual() usuario: Usuario) {
    return this.service.listarPorUsuario(usuario.id);
  }

  @Get('no-leidas/conteo')
  @ApiOperation({ summary: 'Obtener cantidad de notificaciones no leídas' })
  contarNoLeidas(@UsuarioActual() usuario: Usuario) {
    return this.service.contarNoLeidas(usuario.id);
  }

  @Patch(':id/leer')
  @ApiOperation({ summary: 'Marcar una notificación como leída' })
  marcarLeida(@Param('id') id: string, @UsuarioActual() usuario: Usuario) {
    return this.service.marcarLeida(id, usuario.id);
  }

  @Patch('leer-todas')
  @ApiOperation({ summary: 'Marcar todas las notificaciones del usuario como leídas' })
  marcarTodasLeidas(@UsuarioActual() usuario: Usuario) {
    return this.service.marcarTodasLeidas(usuario.id);
  }
}
