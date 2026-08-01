import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { ObrasSocialesService } from '../obras-sociales/obras-sociales.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepo: Repository<Usuario>,
    private readonly obrasSocialesService: ObrasSocialesService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existe = await this.usuariosRepo.findOne({ where: { email: dto.email } });
    if (existe) throw new ConflictException('El email ya está registrado');

    const dniExiste = await this.usuariosRepo.findOne({ where: { dni: dto.dni } });
    if (dniExiste) throw new ConflictException('El DNI ya está registrado');

    let afiliacionVerificada = false;
    if (dto.obraSocialId) {
      const resultado = await this.obrasSocialesService.validarAfiliado(dto.obraSocialId, {
        numeroAfiliado: dto.numeroAfiliado,
        dni: dto.dni,
      });
      afiliacionVerificada = resultado.afiliado && resultado.vigente;
    }

    const hash = await bcrypt.hash(dto.password, 10);
    const usuario = this.usuariosRepo.create({ ...dto, password: hash, afiliacionVerificada });
    await this.usuariosRepo.save(usuario);

    return this.generarToken(usuario);
  }

  async login(dto: LoginDto) {
    const usuario = await this.usuariosRepo.findOne({ where: { email: dto.email } });
    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const valido = await bcrypt.compare(dto.password, usuario.password);
    if (!valido) throw new UnauthorizedException('Credenciales inválidas');

    return this.generarToken(usuario);
  }

  async perfil(usuarioId: string) {
    return this.usuariosRepo.findOneOrFail({
      where: { id: usuarioId },
      relations: ['obraSocial'],
    });
  }

  private generarToken(usuario: Usuario) {
    const payload = { sub: usuario.id, email: usuario.email, rol: usuario.rol };
    return {
      accessToken: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        rol: usuario.rol,
      },
    };
  }
}
