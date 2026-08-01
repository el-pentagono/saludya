import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EstadoAfiliado } from '../../common/enums/estado-afiliado.enum';
import { Afiliado } from './entities/afiliado.entity';
import { ObraSocial } from './entities/obra-social.entity';
import { ObrasSocialesService } from './obras-sociales.service';

const obraSocial = { id: 'os-1', codigo: 'PAMI', nombre: 'PAMI', activa: true } as ObraSocial;

describe('ObrasSocialesService', () => {
  let service: ObrasSocialesService;
  let repo: { findOne: jest.Mock };
  let afiliadosRepo: { findOne: jest.Mock };

  beforeEach(async () => {
    repo = { findOne: jest.fn() };
    afiliadosRepo = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ObrasSocialesService,
        { provide: getRepositoryToken(ObraSocial), useValue: repo },
        { provide: getRepositoryToken(Afiliado), useValue: afiliadosRepo },
      ],
    }).compile();

    service = module.get(ObrasSocialesService);
  });

  describe('validarAfiliado', () => {
    it('lanza NotFoundException si la obra social no existe', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(
        service.validarAfiliado('inexistente', { numeroAfiliado: '1', dni: '20111222' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('devuelve afiliado:false si no hay match en el padrón', async () => {
      repo.findOne.mockResolvedValue(obraSocial);
      afiliadosRepo.findOne.mockResolvedValue(null);

      const resultado = await service.validarAfiliado(obraSocial.id, {
        numeroAfiliado: '000',
        dni: '20111222',
      });

      expect(resultado).toEqual({ afiliado: false, vigente: false });
    });

    it('devuelve afiliado:true, vigente:true si está activo y sin vencimiento', async () => {
      repo.findOne.mockResolvedValue(obraSocial);
      afiliadosRepo.findOne.mockResolvedValue({
        estado: EstadoAfiliado.ACTIVO,
        vigenciaHasta: null,
        nombreTitular: 'Juan Pérez',
      } as Afiliado);

      const resultado = await service.validarAfiliado(obraSocial.id, {
        numeroAfiliado: '0001112223',
        dni: '20111222',
      });

      expect(resultado).toEqual({ afiliado: true, vigente: true, nombreTitular: 'Juan Pérez' });
    });

    it('devuelve vigente:false si el afiliado está inactivo', async () => {
      repo.findOne.mockResolvedValue(obraSocial);
      afiliadosRepo.findOne.mockResolvedValue({
        estado: EstadoAfiliado.INACTIVO,
        vigenciaHasta: null,
        nombreTitular: 'Juan Pérez',
      } as Afiliado);

      const resultado = await service.validarAfiliado(obraSocial.id, {
        numeroAfiliado: '0001112223',
        dni: '20111222',
      });

      expect(resultado).toEqual({ afiliado: true, vigente: false, nombreTitular: 'Juan Pérez' });
    });

    it('devuelve vigente:false si la vigencia ya venció', async () => {
      repo.findOne.mockResolvedValue(obraSocial);
      afiliadosRepo.findOne.mockResolvedValue({
        estado: EstadoAfiliado.ACTIVO,
        vigenciaHasta: new Date('2020-01-01'),
        nombreTitular: 'Juan Pérez',
      } as Afiliado);

      const resultado = await service.validarAfiliado(obraSocial.id, {
        numeroAfiliado: '0001112223',
        dni: '20111222',
      });

      expect(resultado).toEqual({ afiliado: true, vigente: false, nombreTitular: 'Juan Pérez' });
    });
  });
});
