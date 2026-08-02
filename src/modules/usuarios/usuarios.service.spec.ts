import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Rol } from '../../common/enums/rol.enum';
import { Usuario } from './entities/usuario.entity';
import { UsuariosService } from './usuarios.service';

describe('UsuariosService', () => {
  let service: UsuariosService;
  let repo: { find: jest.Mock; findOne: jest.Mock };

  beforeEach(async () => {
    repo = { find: jest.fn(), findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsuariosService, { provide: getRepositoryToken(Usuario), useValue: repo }],
    }).compile();

    service = module.get(UsuariosService);
  });

  describe('listarMedicos', () => {
    it('lista médicos activos con campos mínimos', async () => {
      repo.find.mockResolvedValue([]);

      await service.listarMedicos();

      expect(repo.find).toHaveBeenCalledWith({
        where: { rol: Rol.MEDICO, activo: true },
        select: ['id', 'nombre', 'apellido'],
        order: { apellido: 'ASC' },
      });
    });
  });

  describe('buscarPacientePorDni', () => {
    it('devuelve el paciente si existe con ese DNI', async () => {
      const paciente = { id: 'paciente-1', nombre: 'Ana', apellido: 'Gómez', dni: '20111222' };
      repo.findOne.mockResolvedValue(paciente);

      await expect(service.buscarPacientePorDni('20111222')).resolves.toBe(paciente);
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { dni: '20111222', rol: Rol.PACIENTE },
        select: ['id', 'nombre', 'apellido', 'dni'],
      });
    });

    it('lanza NotFoundException si no hay un paciente con ese DNI', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.buscarPacientePorDni('00000000')).rejects.toThrow(NotFoundException);
    });
  });
});
