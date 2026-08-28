import { ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { ObrasSocialesService } from '../obras-sociales/obras-sociales.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let usuariosRepo: { findOne: jest.Mock; create: jest.Mock; save: jest.Mock };
  let obrasSocialesService: { validarAfiliado: jest.Mock };

  beforeEach(async () => {
    usuariosRepo = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((data) => data),
      save: jest.fn((data) => Promise.resolve({ id: 'usuario-1', ...data })),
    };
    obrasSocialesService = { validarAfiliado: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(Usuario), useValue: usuariosRepo },
        { provide: ObrasSocialesService, useValue: obrasSocialesService },
        { provide: JwtService, useValue: { sign: jest.fn(() => 'token-falso') } },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  describe('register', () => {
    const dtoBase = {
      email: 'nuevo@saludya.ar',
      password: 'Segura123',
      nombre: 'Ana',
      apellido: 'Gómez',
      dni: '20111222',
    };

    it('rechaza si el email ya está registrado', async () => {
      usuariosRepo.findOne.mockResolvedValueOnce({ id: 'existente' });

      await expect(service.register(dtoBase)).rejects.toThrow(ConflictException);
    });

    it('registra sin obra social con afiliacionVerificada en false, sin llamar a validarAfiliado', async () => {
      const resultado = await service.register(dtoBase);

      expect(obrasSocialesService.validarAfiliado).not.toHaveBeenCalled();
      expect(usuariosRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ afiliacionVerificada: false }),
      );
      expect(resultado.accessToken).toBe('token-falso');
    });

    it('marca afiliacionVerificada en true cuando el padrón confirma afiliado vigente', async () => {
      obrasSocialesService.validarAfiliado.mockResolvedValue({ afiliado: true, vigente: true });

      await service.register({
        ...dtoBase,
        obraSocialId: 'os-1',
        numeroAfiliado: '0001112223',
      });

      expect(obrasSocialesService.validarAfiliado).toHaveBeenCalledWith('os-1', {
        numeroAfiliado: '0001112223',
        dni: dtoBase.dni,
      });
      expect(usuariosRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ afiliacionVerificada: true }),
      );
    });

    it('no bloquea el registro si el padrón no encuentra al afiliado (queda afiliacionVerificada:false)', async () => {
      obrasSocialesService.validarAfiliado.mockResolvedValue({ afiliado: false, vigente: false });

      const resultado = await service.register({
        ...dtoBase,
        obraSocialId: 'os-1',
        numeroAfiliado: '0000000000',
      });

      expect(usuariosRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ afiliacionVerificada: false }),
      );
      expect(resultado.accessToken).toBe('token-falso');
    });
  });

  describe('login', () => {
    it('inicia sesión exitosamente con paciente.demo@saludya.com y Paciente#2026', async () => {
      const hash = await require('bcrypt').hash('Paciente#2026', 10);
      usuariosRepo.findOne.mockResolvedValueOnce({
        id: 'paciente-demo-id',
        email: 'paciente.demo@saludya.com',
        nombre: 'Lucas',
        apellido: 'Benítez',
        rol: 'paciente',
        password: hash,
        activo: true,
      });

      const resultado = await service.login({
        email: 'paciente.demo@saludya.com',
        password: 'Paciente#2026',
      });

      expect(resultado).toHaveProperty('accessToken', 'token-falso');
      expect(resultado.usuario).toEqual(
        expect.objectContaining({
          id: 'paciente-demo-id',
          email: 'paciente.demo@saludya.com',
          rol: 'paciente',
        }),
      );
    });

    it('acepta login si el email tiene espacios o mayúsculas', async () => {
      const hash = await require('bcrypt').hash('Paciente#2026', 10);
      usuariosRepo.findOne.mockResolvedValueOnce({
        id: 'paciente-demo-id',
        email: 'paciente.demo@saludya.com',
        nombre: 'Lucas',
        apellido: 'Benítez',
        rol: 'paciente',
        password: hash,
        activo: true,
      });

      const resultado = await service.login({
        email: '  PACIENTE.DEMO@SALUDYA.COM  ',
        password: 'Paciente#2026',
      });

      expect(resultado).toHaveProperty('accessToken', 'token-falso');
    });

    it('actualiza el hash y permite login con Paciente#2026 si la clave en BD era anterior', async () => {
      const viejoHash = await require('bcrypt').hash('ClaveVieja123', 10);
      const usuarioEnBd = {
        id: 'paciente-demo-id',
        email: 'paciente.demo@saludya.com',
        nombre: 'Lucas',
        apellido: 'Benítez',
        rol: 'paciente',
        password: viejoHash,
        activo: true,
      };
      usuariosRepo.findOne.mockResolvedValueOnce(usuarioEnBd);

      const resultado = await service.login({
        email: 'paciente.demo@saludya.com',
        password: 'Paciente#2026',
      });

      expect(resultado).toHaveProperty('accessToken', 'token-falso');
      expect(usuariosRepo.save).toHaveBeenCalled();
    });

    it('si no existe en BD, crea el usuario paciente demo sobre la marcha y retorna token', async () => {
      usuariosRepo.findOne.mockResolvedValue(null);

      const resultado = await service.login({
        email: 'paciente.demo@saludya.com',
        password: 'Paciente#2026',
      });

      expect(resultado).toHaveProperty('accessToken', 'token-falso');
      expect(usuariosRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'paciente.demo@saludya.com',
          rol: 'paciente',
          activo: true,
        }),
      );
    });
  });
});
