import { EstadoAfiliado } from '../../common/enums/estado-afiliado.enum';

export const AFILIADOS_SEED: Record<
  string,
  Array<{
    numeroAfiliado: string;
    dni: string;
    nombreTitular: string;
    estado: EstadoAfiliado;
    vigenciaHasta?: Date;
  }>
> = {
  PAMI: [
    {
      numeroAfiliado: '0001112223',
      dni: '20111222',
      nombreTitular: 'Afiliado Demo PAMI 1',
      estado: EstadoAfiliado.ACTIVO,
    },
    {
      numeroAfiliado: '0004445556',
      dni: '20444555',
      nombreTitular: 'Afiliado Demo PAMI 2 (inactivo)',
      estado: EstadoAfiliado.INACTIVO,
    },
  ],
  IOMA: [
    {
      numeroAfiliado: 'IOMA-1001',
      dni: '30111222',
      nombreTitular: 'Afiliado Demo IOMA 1',
      estado: EstadoAfiliado.ACTIVO,
    },
    {
      numeroAfiliado: 'IOMA-1002',
      dni: '30444555',
      nombreTitular: 'Afiliado Demo IOMA 2 (vencido)',
      estado: EstadoAfiliado.ACTIVO,
      vigenciaHasta: new Date('2020-01-01'),
    },
  ],
  OSDE: [
    {
      numeroAfiliado: '210-000111-2',
      dni: '25111222',
      nombreTitular: 'Afiliado Demo OSDE 1',
      estado: EstadoAfiliado.ACTIVO,
    },
    {
      numeroAfiliado: '210-000444-5',
      dni: '25444555',
      nombreTitular: 'Afiliado Demo OSDE 2 (inactivo)',
      estado: EstadoAfiliado.INACTIVO,
    },
  ],
};
