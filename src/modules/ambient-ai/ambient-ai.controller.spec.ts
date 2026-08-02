import {
  obtenerGuardsDeClase,
  obtenerRolesDeMetodo,
} from '../../common/testing/controller-metadata.helper';
import { Rol } from '../../common/enums/rol.enum';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AmbientAiController } from './ambient-ai.controller';

describe('AmbientAiController — guards y roles por endpoint', () => {
  it('aplica JwtGuard y RolesGuard a nivel de clase', () => {
    const guards = obtenerGuardsDeClase(AmbientAiController);

    expect(guards).toContain(JwtGuard);
    expect(guards).toContain(RolesGuard);
  });

  it('crear: solo MEDICO', () => {
    expect(obtenerRolesDeMetodo(AmbientAiController.prototype.crear)).toEqual([Rol.MEDICO]);
  });

  it('confirmar: solo MEDICO', () => {
    expect(obtenerRolesDeMetodo(AmbientAiController.prototype.confirmar)).toEqual([Rol.MEDICO]);
  });

  it('listar, buscarPorId: sin restricción de rol (chequeo de pertenencia en el service)', () => {
    expect(obtenerRolesDeMetodo(AmbientAiController.prototype.listar)).toBeUndefined();
    expect(obtenerRolesDeMetodo(AmbientAiController.prototype.buscarPorId)).toBeUndefined();
  });
});
