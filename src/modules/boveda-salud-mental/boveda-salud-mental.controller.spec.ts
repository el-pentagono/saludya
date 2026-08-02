import {
  obtenerGuardsDeClase,
  obtenerRolesDeMetodo,
} from '../../common/testing/controller-metadata.helper';
import { Rol } from '../../common/enums/rol.enum';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { BovedaSaludMentalController } from './boveda-salud-mental.controller';

describe('BovedaSaludMentalController — guards y roles por endpoint', () => {
  it('aplica JwtGuard y RolesGuard a nivel de clase', () => {
    const guards = obtenerGuardsDeClase(BovedaSaludMentalController);

    expect(guards).toContain(JwtGuard);
    expect(guards).toContain(RolesGuard);
  });

  it('crear: solo MEDICO', () => {
    expect(obtenerRolesDeMetodo(BovedaSaludMentalController.prototype.crear)).toEqual([
      Rol.MEDICO,
    ]);
  });

  it('listar, buscarPorId: sin restricción de rol (chequeo de pertenencia/autoría en el service)', () => {
    expect(obtenerRolesDeMetodo(BovedaSaludMentalController.prototype.listar)).toBeUndefined();
    expect(
      obtenerRolesDeMetodo(BovedaSaludMentalController.prototype.buscarPorId),
    ).toBeUndefined();
  });
});
