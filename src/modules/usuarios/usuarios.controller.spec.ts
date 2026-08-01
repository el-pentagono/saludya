import {
  obtenerGuardsDeClase,
  obtenerRolesDeMetodo,
} from '../../common/testing/controller-metadata.helper';
import { Rol } from '../../common/enums/rol.enum';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UsuariosController } from './usuarios.controller';

describe('UsuariosController — guards y roles por endpoint', () => {
  it('aplica JwtGuard y RolesGuard a nivel de clase', () => {
    const guards = obtenerGuardsDeClase(UsuariosController);

    expect(guards).toContain(JwtGuard);
    expect(guards).toContain(RolesGuard);
  });

  it('findAll: solo DIRECTOR y AUDITOR', () => {
    expect(obtenerRolesDeMetodo(UsuariosController.prototype.findAll)).toEqual([
      Rol.DIRECTOR,
      Rol.AUDITOR,
    ]);
  });

  it('findOne: solo DIRECTOR y AUDITOR', () => {
    expect(obtenerRolesDeMetodo(UsuariosController.prototype.findOne)).toEqual([
      Rol.DIRECTOR,
      Rol.AUDITOR,
    ]);
  });

  it('create: solo DIRECTOR', () => {
    expect(obtenerRolesDeMetodo(UsuariosController.prototype.create)).toEqual([Rol.DIRECTOR]);
  });

  it('desactivar: solo DIRECTOR', () => {
    expect(obtenerRolesDeMetodo(UsuariosController.prototype.desactivar)).toEqual([Rol.DIRECTOR]);
  });

  it('miPerfil, update: sin restricción de rol (acceso al propio usuario)', () => {
    expect(obtenerRolesDeMetodo(UsuariosController.prototype.miPerfil)).toBeUndefined();
    expect(obtenerRolesDeMetodo(UsuariosController.prototype.update)).toBeUndefined();
  });
});
