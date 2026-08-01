import {
  obtenerGuardsDeClase,
  obtenerRolesDeMetodo,
} from '../../common/testing/controller-metadata.helper';
import { Rol } from '../../common/enums/rol.enum';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MedicalRecordsController } from './medical-records.controller';

describe('MedicalRecordsController — guards y roles por endpoint', () => {
  it('aplica JwtGuard y RolesGuard a nivel de clase', () => {
    const guards = obtenerGuardsDeClase(MedicalRecordsController);

    expect(guards).toContain(JwtGuard);
    expect(guards).toContain(RolesGuard);
  });

  it('crear: solo MEDICO', () => {
    expect(obtenerRolesDeMetodo(MedicalRecordsController.prototype.crear)).toEqual([Rol.MEDICO]);
  });

  it('listarTodas: solo DIRECTOR y AUDITOR', () => {
    expect(obtenerRolesDeMetodo(MedicalRecordsController.prototype.listarTodas)).toEqual([
      Rol.DIRECTOR,
      Rol.AUDITOR,
    ]);
  });

  it('historialDePaciente, buscarPorId: sin restricción de rol (vínculo asistencial en el service)', () => {
    expect(
      obtenerRolesDeMetodo(MedicalRecordsController.prototype.historialDePaciente),
    ).toBeUndefined();
    expect(obtenerRolesDeMetodo(MedicalRecordsController.prototype.buscarPorId)).toBeUndefined();
  });
});
