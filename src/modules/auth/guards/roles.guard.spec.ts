import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Rol } from '../../../common/enums/rol.enum';
import { RolesGuard } from './roles.guard';

const handlerRef = () => undefined;
const classRef = () => undefined;

const crearContext = (user?: { rol: Rol }): ExecutionContext =>
  ({
    getHandler: () => handlerRef,
    getClass: () => classRef,
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  }) as unknown as ExecutionContext;

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: { getAllAndOverride: jest.Mock };

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() };
    guard = new RolesGuard(reflector as unknown as Reflector);
  });

  it('permite el acceso si el endpoint no declara @Roles', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    expect(guard.canActivate(crearContext({ rol: Rol.PACIENTE }))).toBe(true);
  });

  it('permite el acceso si el rol del usuario está en la lista requerida', () => {
    reflector.getAllAndOverride.mockReturnValue([Rol.MEDICO, Rol.DIRECTOR]);

    expect(guard.canActivate(crearContext({ rol: Rol.MEDICO }))).toBe(true);
  });

  it('rechaza el acceso si el rol del usuario no está en la lista requerida', () => {
    reflector.getAllAndOverride.mockReturnValue([Rol.MEDICO, Rol.DIRECTOR]);

    expect(guard.canActivate(crearContext({ rol: Rol.PACIENTE }))).toBe(false);
  });

  it('rechaza el acceso si no hay usuario autenticado en el request', () => {
    reflector.getAllAndOverride.mockReturnValue([Rol.MEDICO]);

    expect(guard.canActivate(crearContext(undefined))).toBe(false);
  });

  it('usa getHandler y getClass como fuentes de metadata (override por handler)', () => {
    reflector.getAllAndOverride.mockReturnValue([Rol.AUDITOR]);
    const context = crearContext({ rol: Rol.AUDITOR });

    guard.canActivate(context);

    expect(reflector.getAllAndOverride).toHaveBeenCalledWith('roles', [handlerRef, classRef]);
  });
});
