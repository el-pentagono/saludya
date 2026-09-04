import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Rol } from '../../common/enums/rol.enum';
import { Usuario } from './entities/usuario.entity';
import { UsuariosService } from './usuarios.service';

describe('UsuariosService', () => {
  let service: UsuariosService;
  let repo: { find: jest.Mock; findOne: jest.Mock; save: jest.Mock };

  beforeEach(async () => {
    repo = { find: jest.fn(), findOne: jest.fn(), save: jest.fn() };

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

  describe('update', () => {
    const base = (): Usuario =>
      ({
        id: 'usuario-1',
        telefono: undefined,
        obraSocialId: undefined,
        numeroAfiliado: undefined,
        afiliacionVerificada: false,
      }) as Usuario;

    it('actualiza el teléfono sin tocar la verificación de afiliación', async () => {
      const usuario = { ...base(), obraSocialId: 'os-1', afiliacionVerificada: true };
      repo.findOne.mockResolvedValue(usuario);
      repo.save.mockImplementation((u) => Promise.resolve(u));

      const resultado = await service.update('usuario-1', { telefono: '11-5555-0000' });

      expect(resultado.telefono).toBe('11-5555-0000');
      expect(resultado.afiliacionVerificada).toBe(true);
    });

    it('invalida la afiliación verificada si cambia la obra social', async () => {
      const usuario = { ...base(), obraSocialId: 'os-1', afiliacionVerificada: true };
      repo.findOne.mockResolvedValue(usuario);
      repo.save.mockImplementation((u) => Promise.resolve(u));

      const resultado = await service.update('usuario-1', { obraSocialId: 'os-2' });

      expect(resultado.obraSocialId).toBe('os-2');
      expect(resultado.afiliacionVerificada).toBe(false);
    });

    it('no deja que la relación obraSocial ya cargada pise el nuevo obraSocialId al guardar', async () => {
      // Reproduce el caso real: el usuario ya tenía una obra social, así que
      // `findOne` trae la relación `obraSocial` cargada (no solo el id).
      const usuario = {
        ...base(),
        obraSocialId: 'os-1',
        obraSocial: { id: 'os-1', codigo: 'OSDE', nombre: 'OSDE', activa: true },
      };
      repo.findOne.mockResolvedValue(usuario);
      repo.save.mockImplementation((u) => Promise.resolve(u));

      await service.update('usuario-1', { obraSocialId: 'os-2' });

      const guardado = repo.save.mock.calls[0][0];
      expect(guardado.obraSocialId).toBe('os-2');
      expect(guardado.obraSocial).toBeUndefined();
    });

    it('invalida la afiliación verificada y limpia el número de afiliado al quitar la obra social', async () => {
      const usuario = {
        ...base(),
        obraSocialId: 'os-1',
        numeroAfiliado: '12345',
        afiliacionVerificada: true,
      };
      repo.findOne.mockResolvedValue(usuario);
      repo.save.mockImplementation((u) => Promise.resolve(u));

      const resultado = await service.update('usuario-1', { obraSocialId: undefined });

      expect(resultado.numeroAfiliado).toBeNull();
      expect(resultado.afiliacionVerificada).toBe(false);
    });
  });
});
