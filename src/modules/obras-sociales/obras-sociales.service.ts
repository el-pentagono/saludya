import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadoAfiliado } from '../../common/enums/estado-afiliado.enum';
import { AFILIADOS_SEED } from './afiliados.seed';
import { ValidarAfiliadoDto } from './dto/validar-afiliado.dto';
import { Afiliado } from './entities/afiliado.entity';
import { ObraSocial } from './entities/obra-social.entity';
import { OBRAS_SOCIALES_SEED } from './obras-sociales.seed';

@Injectable()
export class ObrasSocialesService implements OnModuleInit {
  private readonly logger = new Logger(ObrasSocialesService.name);

  constructor(
    @InjectRepository(ObraSocial)
    private readonly repo: Repository<ObraSocial>,
    @InjectRepository(Afiliado)
    private readonly afiliadosRepo: Repository<Afiliado>,
  ) {}

  async onModuleInit() {
    for (const obraSocial of OBRAS_SOCIALES_SEED) {
      let existente = await this.repo.findOne({ where: { codigo: obraSocial.codigo } });
      if (!existente) {
        existente = await this.repo.save(this.repo.create(obraSocial));
        this.logger.log(`Obra social sembrada: ${obraSocial.codigo}`);
      }

      const afiliadosDemo = AFILIADOS_SEED[obraSocial.codigo] ?? [];
      for (const afiliado of afiliadosDemo) {
        const existeAfiliado = await this.afiliadosRepo.findOne({
          where: { obraSocialId: existente.id, numeroAfiliado: afiliado.numeroAfiliado },
        });
        if (!existeAfiliado) {
          await this.afiliadosRepo.save(
            this.afiliadosRepo.create({ ...afiliado, obraSocialId: existente.id }),
          );
          this.logger.log(`Afiliado demo sembrado: ${obraSocial.codigo} ${afiliado.numeroAfiliado}`);
        }
      }
    }
  }

  async findAll() {
    return this.repo.find({ where: { activa: true }, order: { nombre: 'ASC' } });
  }

  async findOne(id: string) {
    const obraSocial = await this.repo.findOne({ where: { id } });
    if (!obraSocial) throw new NotFoundException(`Obra social ${id} no encontrada`);
    return obraSocial;
  }

  async validarAfiliado(obraSocialId: string, dto: ValidarAfiliadoDto) {
    await this.findOne(obraSocialId);

    const afiliado = await this.afiliadosRepo.findOne({
      where: { obraSocialId, numeroAfiliado: dto.numeroAfiliado, dni: dto.dni },
    });
    if (!afiliado) {
      return { afiliado: false, vigente: false };
    }

    const vigente =
      afiliado.estado === EstadoAfiliado.ACTIVO &&
      (!afiliado.vigenciaHasta || afiliado.vigenciaHasta >= new Date());

    return { afiliado: true, vigente, nombreTitular: afiliado.nombreTitular };
  }
}
