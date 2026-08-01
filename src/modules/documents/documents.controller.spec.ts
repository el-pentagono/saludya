import {
  obtenerGuardsDeClase,
  obtenerRolesDeMetodo,
} from '../../common/testing/controller-metadata.helper';
import { Rol } from '../../common/enums/rol.enum';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { DocumentsController } from './documents.controller';

describe('DocumentsController — guards y roles por endpoint', () => {
  it('aplica JwtGuard y RolesGuard a nivel de clase', () => {
    const guards = obtenerGuardsDeClase(DocumentsController);

    expect(guards).toContain(JwtGuard);
    expect(guards).toContain(RolesGuard);
  });

  it('generarConstanciaAtencion: solo PACIENTE', () => {
    expect(
      obtenerRolesDeMetodo(DocumentsController.prototype.generarConstanciaAtencion),
    ).toEqual([Rol.PACIENTE]);
  });

  it('generarCertificadoTratamiento: solo PACIENTE', () => {
    expect(
      obtenerRolesDeMetodo(DocumentsController.prototype.generarCertificadoTratamiento),
    ).toEqual([Rol.PACIENTE]);
  });

  it('listar, buscarPorId: sin restricción de rol (chequeo de pertenencia en el service)', () => {
    expect(obtenerRolesDeMetodo(DocumentsController.prototype.listar)).toBeUndefined();
    expect(obtenerRolesDeMetodo(DocumentsController.prototype.buscarPorId)).toBeUndefined();
  });
});
