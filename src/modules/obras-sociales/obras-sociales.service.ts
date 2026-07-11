import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObraSocial } from './entities/obra-social.entity';
import { OBRAS_SOCIALES_SEED } from './obras-sociales.seed';

@Injectable()
export class ObrasSocialesService implements OnModuleInit {
  private readonly logger = new Logger(ObrasSocialesService.name);

  constructor(
    @InjectRepository(ObraSocial)
    private readonly repo: Repository<ObraSocial>,
  ) {}

  async onModuleInit() {
    for (const obraSocial of OBRAS_SOCIALES_SEED) {
      const existe = await this.repo.findOne({ where: { codigo: obraSocial.codigo } });
      if (!existe) {
        await this.repo.save(this.repo.create(obraSocial));
        this.logger.log(`Obra social sembrada: ${obraSocial.codigo}`);
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
}
