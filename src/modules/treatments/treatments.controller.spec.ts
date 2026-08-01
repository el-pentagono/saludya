import {
  obtenerGuardsDeClase,
  obtenerRolesDeMetodo,
} from '../../common/testing/controller-metadata.helper';
import { Rol } from '../../common/enums/rol.enum';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TreatmentsController } from './treatments.controller';

describe('TreatmentsController — guards y roles por endpoint', () => {
  it('aplica JwtGuard y RolesGuard a nivel de clase', () => {
    const guards = obtenerGuardsDeClase(TreatmentsController);

    expect(guards).toContain(JwtGuard);
    expect(guards).toContain(RolesGuard);
  });

  it('prescribir: solo MEDICO', () => {
    expect(obtenerRolesDeMetodo(TreatmentsController.prototype.prescribir)).toEqual([Rol.MEDICO]);
  });

  it('dispensar: solo FARMACEUTICO', () => {
    expect(obtenerRolesDeMetodo(TreatmentsController.prototype.dispensar)).toEqual([
      Rol.FARMACEUTICO,
    ]);
  });

  it('agregarSeguimiento: solo ENFERMERO', () => {
    expect(obtenerRolesDeMetodo(TreatmentsController.prototype.agregarSeguimiento)).toEqual([
      Rol.ENFERMERO,
    ]);
  });

  it('listar, buscarPorId, listarSeguimientos: sin restricción de rol', () => {
    expect(obtenerRolesDeMetodo(TreatmentsController.prototype.listar)).toBeUndefined();
    expect(obtenerRolesDeMetodo(TreatmentsController.prototype.buscarPorId)).toBeUndefined();
    expect(
      obtenerRolesDeMetodo(TreatmentsController.prototype.listarSeguimientos),
    ).toBeUndefined();
  });
});
