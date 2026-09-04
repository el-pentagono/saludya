import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Rol } from '../../common/enums/rol.enum';
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

  async listarMedicos() {
    return this.repo.find({
      where: { rol: Rol.MEDICO, activo: true },
      select: ['id', 'nombre', 'apellido'],
      order: { apellido: 'ASC' },
    });
  }

  async buscarPacientePorDni(dni: string) {
    const paciente = await this.repo.findOne({
      where: { dni, rol: Rol.PACIENTE },
      select: ['id', 'nombre', 'apellido', 'dni'],
    });
    if (!paciente) throw new NotFoundException(`No se encontró un paciente con DNI ${dni}`);
    return paciente;
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
    if (emailExiste) throw new ConflictException('Correo electrónico ya registrado');

    const hash = await bcrypt.hash(dto.password, 10);
    const usuario = this.repo.create({ ...dto, password: hash });
    return this.repo.save(usuario);
  }

  async update(id: string, dto: UpdateUsuarioDto) {
    const usuario = await this.findOne(id);
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }
    // Cambiar de obra social o de número de afiliado invalida la verificación anterior:
    // no puede seguir figurando "verificada" una afiliación distinta a la que se validó.
    const cambiaAfiliacion =
      ('obraSocialId' in dto && dto.obraSocialId !== usuario.obraSocialId) ||
      ('numeroAfiliado' in dto && dto.numeroAfiliado !== usuario.numeroAfiliado);

    Object.assign(usuario, dto);

    if ('obraSocialId' in dto) {
      // `usuario.obraSocial` ya venía cargado (por la relación) con el valor viejo.
      // Si lo dejamos así, TypeORM prioriza esa relación al guardar y pisa el
      // obraSocialId recién asignado, dejando la afiliación vieja aunque se haya
      // elegido una obra social distinta.
      usuario.obraSocial = undefined;
    }

    if (cambiaAfiliacion) {
      usuario.afiliacionVerificada = false;
      if (!usuario.obraSocialId) {
        // TypeORM ignora los campos en `undefined` al guardar (no toca esa columna);
        // hace falta `null` explícito para que la limpieza se refleje en la base.
        usuario.numeroAfiliado = null as unknown as string;
      }
    }

    await this.repo.save(usuario);
    // Vuelve a leerlo con la relación de obra social cargada: save() no la actualiza
    // sola cuando lo que cambió fue el obraSocialId, y el llamador necesita el nombre.
    return this.findOne(id);
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
