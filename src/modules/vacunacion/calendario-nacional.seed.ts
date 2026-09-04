/**
 * Calendario Nacional de Vacunación de Argentina (Ministerio de Salud), representado
 * como catálogo de dosis con la edad objetivo de aplicación en días desde el
 * nacimiento. Cubre el esquema obligatorio desde el nacimiento hasta los 16 años
 * (tope de edad del módulo de menores a cargo).
 *
 * El calendario oficial se actualiza periódicamente: esta lista es una referencia
 * representativa del esquema vigente y debería revisarse contra la fuente oficial
 * (argentina.gob.ar/salud/calendario-vacunacion) antes de un despliegue real a
 * producción clínica.
 */
export interface DosisCalendarioSeed {
  codigo: string;
  nombre: string;
  dosis: string;
  edadObjetivoDias: number;
  ventanaAlertaDias?: number;
  descripcion?: string;
  orden: number;
}

export const CALENDARIO_NACIONAL_VACUNACION: DosisCalendarioSeed[] = [
  // --- Recién nacido ---
  {
    codigo: 'bcg-nacer',
    nombre: 'BCG',
    dosis: 'Dosis única',
    edadObjetivoDias: 0,
    descripcion: 'Previene las formas graves de tuberculosis. Se aplica antes de egresar de la maternidad.',
    orden: 10,
  },
  {
    codigo: 'hepb-nacer',
    nombre: 'Hepatitis B',
    dosis: '1ra dosis (nacimiento)',
    edadObjetivoDias: 0,
    descripcion: 'Se aplica dentro de las primeras 12 horas de vida.',
    orden: 20,
  },
  // --- 2 meses ---
  {
    codigo: 'pentavalente-2m',
    nombre: 'Pentavalente (DPT + HB + Hib)',
    dosis: '1ra dosis',
    edadObjetivoDias: 60,
    orden: 30,
  },
  {
    codigo: 'ipv-2m',
    nombre: 'IPV (Polio inactivada)',
    dosis: '1ra dosis',
    edadObjetivoDias: 60,
    orden: 40,
  },
  {
    codigo: 'neumococo-2m',
    nombre: 'Neumococo conjugada',
    dosis: '1ra dosis',
    edadObjetivoDias: 60,
    orden: 50,
  },
  {
    codigo: 'rotavirus-2m',
    nombre: 'Rotavirus',
    dosis: '1ra dosis',
    edadObjetivoDias: 60,
    orden: 60,
  },
  // --- 4 meses ---
  {
    codigo: 'pentavalente-4m',
    nombre: 'Pentavalente (DPT + HB + Hib)',
    dosis: '2da dosis',
    edadObjetivoDias: 120,
    orden: 70,
  },
  {
    codigo: 'ipv-4m',
    nombre: 'IPV (Polio inactivada)',
    dosis: '2da dosis',
    edadObjetivoDias: 120,
    orden: 80,
  },
  {
    codigo: 'neumococo-4m',
    nombre: 'Neumococo conjugada',
    dosis: '2da dosis',
    edadObjetivoDias: 120,
    orden: 90,
  },
  {
    codigo: 'rotavirus-4m',
    nombre: 'Rotavirus',
    dosis: '2da dosis',
    edadObjetivoDias: 120,
    orden: 100,
  },
  // --- 6 meses ---
  {
    codigo: 'pentavalente-6m',
    nombre: 'Pentavalente (DPT + HB + Hib)',
    dosis: '3ra dosis',
    edadObjetivoDias: 180,
    orden: 110,
  },
  {
    codigo: 'ipv-6m',
    nombre: 'IPV (Polio inactivada)',
    dosis: '3ra dosis',
    edadObjetivoDias: 180,
    orden: 120,
  },
  {
    codigo: 'influenza-6m-d1',
    nombre: 'Gripe (Influenza)',
    dosis: '1ra dosis (primovacunación)',
    edadObjetivoDias: 180,
    orden: 130,
  },
  // --- 7 meses ---
  {
    codigo: 'influenza-7m-d2',
    nombre: 'Gripe (Influenza)',
    dosis: '2da dosis (primovacunación)',
    edadObjetivoDias: 210,
    orden: 140,
  },
  // --- 12 meses ---
  {
    codigo: 'triple-viral-12m',
    nombre: 'Triple Viral (Sarampión, Rubéola, Paperas)',
    dosis: '1ra dosis',
    edadObjetivoDias: 365,
    orden: 150,
  },
  {
    codigo: 'neumococo-refuerzo-12m',
    nombre: 'Neumococo conjugada',
    dosis: 'Refuerzo',
    edadObjetivoDias: 365,
    orden: 160,
  },
  {
    codigo: 'hepa-12m',
    nombre: 'Hepatitis A',
    dosis: 'Dosis única',
    edadObjetivoDias: 365,
    orden: 170,
  },
  // --- 15 meses ---
  {
    codigo: 'varicela-15m',
    nombre: 'Varicela',
    dosis: 'Dosis única',
    edadObjetivoDias: 456,
    orden: 180,
  },
  // --- 18 meses ---
  {
    codigo: 'cuadruple-refuerzo-18m',
    nombre: 'Cuádruple (DPT + Hib)',
    dosis: 'Refuerzo',
    edadObjetivoDias: 548,
    orden: 190,
  },
  {
    codigo: 'opv-refuerzo-18m',
    nombre: 'OPV (Polio oral)',
    dosis: 'Refuerzo',
    edadObjetivoDias: 548,
    orden: 200,
  },
  // --- 5-6 años (ingreso escolar) ---
  {
    codigo: 'triple-bacteriana-5a',
    nombre: 'Triple Bacteriana Celular (DPT)',
    dosis: 'Refuerzo (ingreso escolar)',
    edadObjetivoDias: 2190,
    orden: 210,
  },
  {
    codigo: 'opv-5a',
    nombre: 'OPV (Polio oral)',
    dosis: 'Refuerzo (ingreso escolar)',
    edadObjetivoDias: 2190,
    orden: 220,
  },
  {
    codigo: 'triple-viral-5a',
    nombre: 'Triple Viral (Sarampión, Rubéola, Paperas)',
    dosis: '2da dosis (ingreso escolar)',
    edadObjetivoDias: 2190,
    orden: 230,
  },
  // --- 11 años ---
  {
    codigo: 'vph-11a-d1',
    nombre: 'VPH (Virus Papiloma Humano)',
    dosis: '1ra dosis',
    edadObjetivoDias: 4015,
    ventanaAlertaDias: 30,
    orden: 240,
  },
  {
    codigo: 'dtpa-11a',
    nombre: 'Triple Bacteriana Acelular (dTpa)',
    dosis: 'Refuerzo',
    edadObjetivoDias: 4015,
    ventanaAlertaDias: 30,
    orden: 250,
  },
  {
    codigo: 'meningococo-11a',
    nombre: 'Meningococo tetravalente',
    dosis: 'Refuerzo',
    edadObjetivoDias: 4015,
    ventanaAlertaDias: 30,
    orden: 260,
  },
  // --- 11 años y medio ---
  {
    codigo: 'vph-11a6m-d2',
    nombre: 'VPH (Virus Papiloma Humano)',
    dosis: '2da dosis',
    edadObjetivoDias: 4197,
    ventanaAlertaDias: 30,
    orden: 270,
  },
];
