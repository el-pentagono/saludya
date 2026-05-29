import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { UsuarioActual } from '../../common/decorators/usuario-actual.decorator';
import { Rol } from '../../common/enums/rol.enum';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario } from './entities/usuario.entity';
import { UsuariosService } from './usuarios.service';

@ApiTags('usuarios')
@ApiBearerAuth()
@UseGuards(JwtGuard, RolesGuard)
@Controller('api/usuarios')
export class UsuariosController {
  constructor(private readonly service: UsuariosService) {}

  @Get()
  @Roles(Rol.ADMIN, Rol.MODERADOR)
  @ApiOperation({ summary: 'Listar todos los usuarios' })
  findAll() {
    return this.service.findAll();
  }

  @Get('yo')
  @ApiOperation({ summary: 'Ver mi perfil completo' })
  miPerfil(@UsuarioActual() usuario: Usuario) {
    return this.service.findOne(usuario.id);
  }

  @Get(':id')
  @Roles(Rol.ADMIN, Rol.MODERADOR)
  @ApiOperation({ summary: 'Ver usuario por ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles(Rol.ADMIN)
  @ApiOperation({ summary: 'Crear usuario (solo admin)' })
  create(@Body() dto: CreateUsuarioDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar usuario' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUsuarioDto,
    @UsuarioActual() usuarioActual: Usuario,
  ) {
    const targetId = usuarioActual.rol === Rol.ADMIN ? id : usuarioActual.id;
    return this.service.update(targetId, dto);
  }

  @Delete(':id')
  @Roles(Rol.ADMIN)
  @ApiOperation({ summary: 'Desactivar usuario' })
  desactivar(@Param('id') id: string) {
    return this.service.desactivar(id);
  }
}
