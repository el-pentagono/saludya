import {
  obtenerGuardsDeClase,
  obtenerRolesDeMetodo,
} from '../../common/testing/controller-metadata.helper';
import { Rol } from '../../common/enums/rol.enum';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CierreExpressController } from './cierre-express.controller';

describe('CierreExpressController — guards y roles por endpoint', () => {
  it('aplica JwtGuard y RolesGuard a nivel de clase', () => {
    const guards = obtenerGuardsDeClase(CierreExpressController);

    expect(guards).toContain(JwtGuard);
    expect(guards).toContain(RolesGuard);
  });

  it('cerrar: solo MEDICO', () => {
    expect(obtenerRolesDeMetodo(CierreExpressController.prototype.cerrar)).toEqual([Rol.MEDICO]);
  });
});
