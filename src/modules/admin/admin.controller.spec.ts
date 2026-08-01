import {
  obtenerGuardsDeClase,
  obtenerRolesDeMetodo,
} from '../../common/testing/controller-metadata.helper';
import { Rol } from '../../common/enums/rol.enum';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminController } from './admin.controller';

describe('AdminController — guards y roles a nivel de clase', () => {
  it('aplica JwtGuard y RolesGuard a nivel de clase', () => {
    const guards = obtenerGuardsDeClase(AdminController);

    expect(guards).toContain(JwtGuard);
    expect(guards).toContain(RolesGuard);
  });

  it('restringe toda la clase a DIRECTOR y AUDITOR', () => {
    expect(obtenerRolesDeMetodo(AdminController)).toEqual([Rol.DIRECTOR, Rol.AUDITOR]);
  });
});
