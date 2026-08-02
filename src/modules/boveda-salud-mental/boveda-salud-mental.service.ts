import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol } from '../../common/enums/rol.enum';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { UsuariosService } from '../usuarios/usuarios.service';
import { CreateRegistroSaludMentalDto } from './dto/create-registro-salud-mental.dto';
import { RegistroSaludMental } from './entities/registro-salud-mental.entity';

@Injectable()
export class BovedaSaludMentalService {
  constructor(
    @InjectRepository(RegistroSaludMental)
    private readonly repo: Repository<RegistroSaludMental>,
    private readonly usuariosService: UsuariosService,
  ) {}

  async crear(medico: Usuario, dto: CreateRegistroSaludMentalDto) {
    const paciente = await this.usuariosService.findOne(dto.pacienteId);
    if (paciente.rol !== Rol.PACIENTE) {
      throw new BadRequestException('El usuario indicado no es un paciente');
    }

    const entrada = this.repo.create({
      pacienteId: paciente.id,
      medicoId: medico.id,
      notasPrivadas: dto.notasPrivadas,
      resumenPaciente: dto.resumenPaciente,
    });
    return this.repo.save(entrada);
  }

  async listar(usuario: Usuario) {
    if (usuario.rol === Rol.PACIENTE) {
      const resultados = await this.repo.find({
        where: { pacienteId: usuario.id },
        relations: ['medico'],
        order: { fecha: 'DESC' },
      });
      return resultados.map((entrada) => this.ocultarNotasPrivadas(entrada));
    }
    if (usuario.rol === Rol.MEDICO) {
      return this.repo.find({
        where: { medicoId: usuario.id },
        relations: ['paciente'],
        order: { fecha: 'DESC' },
      });
    }
    if (usuario.rol === Rol.DIRECTOR || usuario.rol === Rol.AUDITOR) {
      return this.repo.find({
        relations: ['paciente', 'medico'],
        order: { fecha: 'DESC' },
      });
    }
    return [];
  }

  async buscarPorId(id: string, usuario: Usuario) {
    const entrada = await this.repo.findOne({
      where: { id },
      relations: ['paciente', 'medico'],
    });
    if (!entrada) throw new NotFoundException(`Entrada ${id} no encontrada`);

    if (usuario.rol === Rol.PACIENTE) {
      if (entrada.pacienteId !== usuario.id) {
        throw new ForbiddenException('No tenés acceso a esta entrada');
      }
      return this.ocultarNotasPrivadas(entrada);
    }
    if (usuario.rol === Rol.MEDICO) {
      if (entrada.medicoId !== usuario.id) {
        throw new ForbiddenException('No tenés acceso a esta entrada');
      }
      return entrada;
    }
    if (usuario.rol === Rol.DIRECTOR || usuario.rol === Rol.AUDITOR) {
      return entrada;
    }
    throw new ForbiddenException('No tenés acceso a esta entrada');
  }

  private ocultarNotasPrivadas(entrada: RegistroSaludMental) {
    const { notasPrivadas, ...visible } = entrada;
    return visible;
  }
}
