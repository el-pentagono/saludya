import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario } from './entities/usuario.entity';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly repo: Repository<Usuario>,
  ) {}

  async findAll() {
    return this.repo.find({ order: { fechaRegistro: 'DESC' } });
  }

  async findOne(id: string) {
    const usuario = await this.repo.findOne({
      where: { id },
      relations: ['obraSocial'],
    });
    if (!usuario) throw new NotFoundException(`Usuario ${id} no encontrado`);
    return usuario;
  }

  async create(dto: CreateUsuarioDto) {
    const emailExiste = await this.repo.findOne({ where: { email: dto.email } });
    if (emailExiste) throw new ConflictException('Email ya registrado');

    const hash = await bcrypt.hash(dto.password, 10);
    const usuario = this.repo.create({ ...dto, password: hash });
    return this.repo.save(usuario);
  }

  async update(id: string, dto: UpdateUsuarioDto) {
    const usuario = await this.findOne(id);
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }
    Object.assign(usuario, dto);
    return this.repo.save(usuario);
  }

  async desactivar(id: string) {
    const usuario = await this.findOne(id);
    usuario.activo = false;
    return this.repo.save(usuario);
  }

  async marcarIdentidadVerificada(id: string, shieldaiVerificacionId: string) {
    const usuario = await this.findOne(id);
    usuario.identidadVerificada = true;
    usuario.shieldaiVerificacionId = shieldaiVerificacionId;
    return this.repo.save(usuario);
  }
}
