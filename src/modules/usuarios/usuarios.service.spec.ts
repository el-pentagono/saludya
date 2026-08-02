import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Rol } from '../../common/enums/rol.enum';
import { Usuario } from './entities/usuario.entity';
import { UsuariosService } from './usuarios.service';

describe('UsuariosService', () => {
  let service: UsuariosService;
  let repo: { find: jest.Mock };

  beforeEach(async () => {
    repo = { find: jest.fn() };

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
});
