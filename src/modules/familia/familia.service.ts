import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { ActualizarSaludMenorDto } from './dto/actualizar-salud-menor.dto';
import { AdjuntarDocumentoMenorDto } from './dto/adjuntar-documento-menor.dto';
import { CrearConsentimientoDto } from './dto/crear-consentimiento.dto';
import { CrearMenorDto } from './dto/crear-menor.dto';
import { ConsentimientoMenor } from './entities/consentimiento-menor.entity';
import { MenorACargo } from './entities/menor-a-cargo.entity';

@Injectable()
export class FamiliaService {
  constructor(
    @InjectRepository(ConsentimientoMenor)
    private readonly consentimientoRepo: Repository<ConsentimientoMenor>,
    @InjectRepository(MenorACargo)
    private readonly menorRepo: Repository<MenorACargo>,
    @InjectRepository(Appointment)
    private readonly appointmentsRepo: Repository<Appointment>,
  ) {}

  async obtenerConsentimiento(tutorId: string): Promise<ConsentimientoMenor | null> {
    return this.consentimientoRepo.findOne({
      where: { tutorId },
      order: { fechaAceptacion: 'DESC' },
    });
  }

  async aceptarConsentimiento(
    tutor: Usuario,
    dto: CrearConsentimientoDto,
  ): Promise<ConsentimientoMenor> {
    const consentimiento = this.consentimientoRepo.create({
      tutorId: tutor.id,
      versionPolitica: dto.versionPolitica || '1.0',
      textoAceptado: dto.textoAceptado,
      ipAddress: dto.ipAddress || null,
    });
    return this.consentimientoRepo.save(consentimiento);
  }

  async listarMenores(tutorId: string): Promise<MenorACargo[]> {
    return this.menorRepo.find({
      where: { tutorId },
      order: { fechaCreacion: 'DESC' },
    });
  }

  async obtenerMenor(id: string, tutorId: string): Promise<MenorACargo> {
    const menor = await this.menorRepo.findOne({ where: { id } });
    if (!menor) {
      throw new NotFoundException(`Perfil de menor ${id} no encontrado`);
    }
    if (menor.tutorId !== tutorId) {
      throw new ForbiddenException('No tenés permiso para ver este perfil');
    }
    return menor;
  }

  async crearMenor(tutor: Usuario, dto: CrearMenorDto): Promise<MenorACargo> {
    // 1. Verificar consentimiento previo obligatorio
    const consentimiento = await this.obtenerConsentimiento(tutor.id);
    if (!consentimiento) {
      throw new ForbiddenException(
        'Debés aceptar el consentimiento informado de tratamiento de datos de menores antes de registrar un menor a tu cargo.',
      );
    }

    // 2. Validar edad menor de 16 años
    const fechaNac = new Date(`${dto.fechaNacimiento}T00:00:00`);
    const hoy = new Date();
    if (isNaN(fechaNac.getTime())) {
      throw new BadRequestException('La fecha de nacimiento no es válida');
    }
    if (fechaNac.getTime() > hoy.getTime()) {
      throw new BadRequestException('La fecha de nacimiento no puede ser futura');
    }

    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const m = hoy.getMonth() - fechaNac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }
    if (edad >= 16) {
      throw new BadRequestException(
        'El módulo familiar aplica únicamente para menores de 16 años. Los mayores de 16 deben registrarse de forma individual.',
      );
    }

    const estadoVerificacion = dto.documentoRespaldoUrl ? 'documentado' : 'declarado';

    const menor = this.menorRepo.create({
      tutorId: tutor.id,
      nombre: dto.nombre,
      apellido: dto.apellido,
      dni: dto.dni,
      fechaNacimiento: dto.fechaNacimiento,
      relacion: dto.relacion,
      grupoSanguineo: dto.grupoSanguineo || null,
      alergias: dto.alergias || null,
      antecedentes: dto.antecedentes || null,
      pediatraCabecera: dto.pediatraCabecera || null,
      documentoRespaldoUrl: dto.documentoRespaldoUrl || null,
      documentoRespaldoNombre: dto.documentoRespaldoNombre || null,
      documentoRespaldoTipo: dto.documentoRespaldoTipo || (dto.documentoRespaldoUrl ? 'dni' : null),
      estadoVerificacion,
    });

    return this.menorRepo.save(menor);
  }

  async actualizarSaludMenor(
    id: string,
    tutorId: string,
    dto: ActualizarSaludMenorDto,
  ): Promise<MenorACargo> {
    const menor = await this.obtenerMenor(id, tutorId);

    if (dto.grupoSanguineo !== undefined) menor.grupoSanguineo = dto.grupoSanguineo;
    if (dto.alergias !== undefined) menor.alergias = dto.alergias;
    if (dto.antecedentes !== undefined) menor.antecedentes = dto.antecedentes;
    if (dto.pediatraCabecera !== undefined) menor.pediatraCabecera = dto.pediatraCabecera;

    return this.menorRepo.save(menor);
  }

  async adjuntarDocumento(
    id: string,
    tutorId: string,
    dto: AdjuntarDocumentoMenorDto,
  ): Promise<MenorACargo> {
    const menor = await this.obtenerMenor(id, tutorId);

    menor.documentoRespaldoUrl = dto.documentoUrl;
    menor.documentoRespaldoNombre = dto.nombreArchivo;
    menor.documentoRespaldoTipo = dto.tipoDocumento;
    menor.estadoVerificacion = 'documentado';

    return this.menorRepo.save(menor);
  }

  async eliminarMenor(id: string, tutor: Usuario): Promise<{ success: boolean }> {
    const menor = await this.obtenerMenor(id, tutor.id);
    await this.menorRepo.remove(menor);
    return { success: true };
  }

  async listarTurnosMenor(menorId: string, tutorId: string): Promise<Appointment[]> {
    await this.obtenerMenor(menorId, tutorId);
    return this.appointmentsRepo.find({
      where: { menorId, pacienteId: tutorId },
      relations: ['medico'],
      order: { fecha: 'DESC' },
    });
  }
}
