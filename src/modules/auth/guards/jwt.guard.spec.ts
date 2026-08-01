import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { JwtGuard } from './jwt.guard';

const JWT_SECRET = 'secreto-de-test';

const crearContext = (headers: Record<string, string>): { context: ExecutionContext; req: any } => {
  const req: any = { headers };
  const context = {
    switchToHttp: () => ({
      getRequest: () => req,
      getResponse: () => ({}),
    }),
  } as unknown as ExecutionContext;
  return { context, req };
};

describe('JwtGuard', () => {
  let guard: JwtGuard;
  let jwtService: JwtService;
  let usuariosRepo: { findOne: jest.Mock };

  beforeEach(async () => {
    usuariosRepo = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule, JwtModule.register({ secret: JWT_SECRET })],
      providers: [
        JwtGuard,
        JwtStrategy,
        { provide: getRepositoryToken(Usuario), useValue: usuariosRepo },
        {
          provide: ConfigService,
          useValue: { get: (key: string) => (key === 'JWT_SECRET' ? JWT_SECRET : undefined) },
        },
      ],
    }).compile();

    guard = module.get(JwtGuard);
    jwtService = module.get(JwtService);
  });

  it('rechaza requests sin token', async () => {
    const { context } = crearContext({});

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('rechaza un token con firma inválida', async () => {
    const { context } = crearContext({ authorization: 'Bearer token-invalido' });

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('rechaza un token válido si el usuario no existe o está inactivo', async () => {
    usuariosRepo.findOne.mockResolvedValue(null);
    const token = jwtService.sign({ sub: 'usuario-1', email: 'x@saludya.ar' });
    const { context } = crearContext({ authorization: `Bearer ${token}` });

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('permite el acceso con un token válido de un usuario activo y adjunta el usuario al request', async () => {
    const usuario = { id: 'usuario-1', email: 'x@saludya.ar', activo: true, rol: 'paciente' };
    usuariosRepo.findOne.mockResolvedValue(usuario);
    const token = jwtService.sign({ sub: 'usuario-1', email: 'x@saludya.ar' });
    const { context, req } = crearContext({ authorization: `Bearer ${token}` });

    const resultado = await guard.canActivate(context);

    expect(resultado).toBe(true);
    expect(req.user).toEqual(usuario);
    expect(usuariosRepo.findOne).toHaveBeenCalledWith({
      where: { id: 'usuario-1', activo: true },
    });
  });
});
