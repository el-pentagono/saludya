import {
  obtenerGuardsDeClase,
  obtenerRolesDeMetodo,
} from '../../common/testing/controller-metadata.helper';
import { Rol } from '../../common/enums/rol.enum';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TriajeCriticoController } from './triaje-critico.controller';

describe('TriajeCriticoController — guards y roles por endpoint', () => {
  it('aplica JwtGuard y RolesGuard a nivel de clase', () => {
    const guards = obtenerGuardsDeClase(TriajeCriticoController);

    expect(guards).toContain(JwtGuard);
    expect(guards).toContain(RolesGuard);
  });

  it('crear: ENFERMERO o MEDICO', () => {
    expect(obtenerRolesDeMetodo(TriajeCriticoController.prototype.crear)).toEqual([
      Rol.ENFERMERO,
      Rol.MEDICO,
    ]);
  });

  it('asignar, atender: solo MEDICO', () => {
    expect(obtenerRolesDeMetodo(TriajeCriticoController.prototype.asignar)).toEqual([Rol.MEDICO]);
    expect(obtenerRolesDeMetodo(TriajeCriticoController.prototype.atender)).toEqual([Rol.MEDICO]);
  });

  it('cancelar: ENFERMERO o MEDICO', () => {
    expect(obtenerRolesDeMetodo(TriajeCriticoController.prototype.cancelar)).toEqual([
      Rol.ENFERMERO,
      Rol.MEDICO,
    ]);
  });

  it('listar, buscarPorId: sin restricción de rol (chequeo de pertenencia en el service)', () => {
    expect(obtenerRolesDeMetodo(TriajeCriticoController.prototype.listar)).toBeUndefined();
    expect(obtenerRolesDeMetodo(TriajeCriticoController.prototype.buscarPorId)).toBeUndefined();
  });
});
