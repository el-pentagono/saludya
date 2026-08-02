import {
  obtenerGuardsDeClase,
  obtenerRolesDeMetodo,
} from '../../common/testing/controller-metadata.helper';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TeleconsultController } from './teleconsult.controller';

describe('TeleconsultController — guards y roles por endpoint', () => {
  it('aplica JwtGuard y RolesGuard a nivel de clase', () => {
    const guards = obtenerGuardsDeClase(TeleconsultController);

    expect(guards).toContain(JwtGuard);
    expect(guards).toContain(RolesGuard);
  });

  it('obtenerSala: sin restricción de rol (chequeo de pertenencia al turno en el service)', () => {
    expect(obtenerRolesDeMetodo(TeleconsultController.prototype.obtenerSala)).toBeUndefined();
  });
});
