import { GUARDS_METADATA } from '@nestjs/common/constants';
import { ROLES_KEY } from '../decorators/roles.decorator';

export const obtenerGuardsDeClase = (controller: Function): Function[] =>
  Reflect.getMetadata(GUARDS_METADATA, controller) ?? [];

export const obtenerRolesDeMetodo = (metodo: Function): string[] | undefined =>
  Reflect.getMetadata(ROLES_KEY, metodo);
