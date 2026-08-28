import { ConflictException, UnauthorizedException } from '@nestjs/common';
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
    // La cuenta demo (demo.paciente@saludya.com.ar / Paciente#2026) no tiene
    // ninguna rama especial acá: existe porque DemoSeedService la siembra en
    // cada arranque con ese hash. login() es el mismo camino para todas las
    // cuentas, demo o reales.
    it('inicia sesión exitosamente con email y contraseña correctos', async () => {
      const hash = await require('bcrypt').hash('Paciente#2026', 10);
      usuariosRepo.findOne.mockResolvedValueOnce({
        id: 'paciente-demo-id',
        email: 'demo.paciente@saludya.com.ar',
        nombre: 'Lucas',
        apellido: 'Benítez',
        rol: 'paciente',
        password: hash,
        activo: true,
      });

      const resultado = await service.login({
        email: 'demo.paciente@saludya.com.ar',
        password: 'Paciente#2026',
      });

      expect(resultado).toHaveProperty('accessToken', 'token-falso');
      expect(resultado.usuario).toEqual(
        expect.objectContaining({
          id: 'paciente-demo-id',
          email: 'demo.paciente@saludya.com.ar',
          rol: 'paciente',
        }),
      );
      // No debe escribir nada en un login exitoso normal.
      expect(usuariosRepo.save).not.toHaveBeenCalled();
    });

    it('acepta login si el email tiene espacios o mayúsculas', async () => {
      const hash = await require('bcrypt').hash('Paciente#2026', 10);
      usuariosRepo.findOne.mockResolvedValueOnce({
        id: 'paciente-demo-id',
        email: 'demo.paciente@saludya.com.ar',
        nombre: 'Lucas',
        apellido: 'Benítez',
        rol: 'paciente',
        password: hash,
        activo: true,
      });

      const resultado = await service.login({
        email: '  DEMO.PACIENTE@SALUDYA.COM.AR  ',
        password: 'Paciente#2026',
      });

      expect(resultado).toHaveProperty('accessToken', 'token-falso');
    });

    it('rechaza con "Credenciales inválidas" si el email no existe, sin crear nada', async () => {
      usuariosRepo.findOne.mockResolvedValue(null);

      await expect(
        service.login({ email: 'no-existe@saludya.com.ar', password: 'Paciente#2026' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(usuariosRepo.create).not.toHaveBeenCalled();
      expect(usuariosRepo.save).not.toHaveBeenCalled();
    });

    it('rechaza si la cuenta existe pero está inactiva', async () => {
      const hash = await require('bcrypt').hash('Paciente#2026', 10);
      usuariosRepo.findOne.mockResolvedValueOnce({
        id: 'usuario-1',
        email: 'paciente@saludya.com.ar',
        password: hash,
        activo: false,
      });

      await expect(
        service.login({ email: 'paciente@saludya.com.ar', password: 'Paciente#2026' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    // Regresión del backdoor encontrado en producción: antes, mandar la
    // contraseña de demo contra CUALQUIER cuenta con rol paciente (el rol
    // por default de todo paciente real) pisaba su password real y dejaba
    // entrar igual. Un paciente real con su propia contraseña, aunque
    // coincida por texto con la de demo en otra cuenta, nunca debe poder
    // loguearse en una cuenta que no es la suya ni mutar su password.
    it('NO acepta la contraseña de demo contra una cuenta real con hash distinto (sin backdoor)', async () => {
      const hashReal = await require('bcrypt').hash('MiClaveReal!456', 10);
      const usuarioReal = {
        id: 'paciente-real-id',
        email: 'paciente.real@saludya.com.ar',
        rol: 'paciente',
        password: hashReal,
        activo: true,
      };
      usuariosRepo.findOne.mockResolvedValueOnce(usuarioReal);

      await expect(
        service.login({ email: 'paciente.real@saludya.com.ar', password: 'Paciente#2026' }),
      ).rejects.toThrow(UnauthorizedException);

      // Y sobre todo: la password real de la cuenta no debe haberse tocado.
      expect(usuariosRepo.save).not.toHaveBeenCalled();
      expect(usuarioReal.password).toBe(hashReal);
    });

    it('rechaza contraseña incorrecta contra la cuenta demo real, sin mutarla', async () => {
      const hash = await require('bcrypt').hash('Paciente#2026', 10);
      const cuentaDemo = {
        id: 'paciente-demo-id',
        email: 'demo.paciente@saludya.com.ar',
        rol: 'paciente',
        password: hash,
        activo: true,
      };
      usuariosRepo.findOne.mockResolvedValueOnce(cuentaDemo);

      await expect(
        service.login({ email: 'demo.paciente@saludya.com.ar', password: 'ClaveIncorrecta' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(usuariosRepo.save).not.toHaveBeenCalled();
      expect(cuentaDemo.password).toBe(hash);
    });
  });
});
