import {
  obtenerGuardsDeClase,
  obtenerRolesDeMetodo,
} from '../../common/testing/controller-metadata.helper';
import { Rol } from '../../common/enums/rol.enum';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AppointmentsController } from './appointments.controller';

describe('AppointmentsController — guards y roles por endpoint', () => {
  it('aplica JwtGuard y RolesGuard a nivel de clase', () => {
    const guards = obtenerGuardsDeClase(AppointmentsController);

    expect(guards).toContain(JwtGuard);
    expect(guards).toContain(RolesGuard);
  });

  it('crear: solo PACIENTE', () => {
    expect(obtenerRolesDeMetodo(AppointmentsController.prototype.crear)).toEqual([Rol.PACIENTE]);
  });

  it('listar, buscarPorId, cancelar: sin restricción de rol (chequeo de pertenencia en el service)', () => {
    expect(obtenerRolesDeMetodo(AppointmentsController.prototype.listar)).toBeUndefined();
    expect(obtenerRolesDeMetodo(AppointmentsController.prototype.buscarPorId)).toBeUndefined();
    expect(obtenerRolesDeMetodo(AppointmentsController.prototype.cancelar)).toBeUndefined();
  });
});
