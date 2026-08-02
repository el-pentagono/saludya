export type Rol = 'paciente' | 'medico' | 'enfermero' | 'farmaceutico' | 'director' | 'auditor';

export interface UsuarioResumen {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: Rol;
}

export interface ObraSocial {
  id: string;
  codigo: string;
  nombre: string;
  activa: boolean;
}

export interface Usuario extends UsuarioResumen {
  dni: string;
  telefono?: string;
  activo: boolean;
  obraSocialId?: string;
  obraSocial?: ObraSocial;
  numeroAfiliado?: string;
  afiliacionVerificada: boolean;
  fechaRegistro: string;
}

export interface PersonaResumen {
  id: string;
  nombre: string;
  apellido: string;
}

/** Alias semántico: misma forma que PersonaResumen, usado en GET /api/usuarios/medicos */
export type Medico = PersonaResumen;

export type EstadoTurno = 'pendiente' | 'cancelado' | 'cerrado';
export type EstadoLiquidacion = 'no_aplica' | 'pendiente';

export interface Appointment {
  id: string;
  pacienteId: string;
  paciente?: PersonaResumen;
  medicoId: string;
  medico?: PersonaResumen;
  fecha: string;
  motivo?: string;
  estado: EstadoTurno;
  diagnosticoCierre?: string;
  estadoLiquidacion: EstadoLiquidacion;
  fechaCreacion: string;
}

export interface MedicalRecordEntry {
  id: string;
  pacienteId: string;
  paciente?: PersonaResumen;
  medicoId: string;
  medico?: PersonaResumen;
  diagnostico: string;
  notas?: string;
  fecha: string;
}

export type TipoDocumento = 'constancia_atencion' | 'certificado_tratamiento';

export interface DocumentoEmitido {
  id: string;
  pacienteId: string;
  tipo: TipoDocumento;
  appointmentId?: string;
  treatmentId?: string;
  numeroConstancia: string;
  urlDescarga: string;
  fechaEmision: string;
}

export type EstadoTratamiento = 'prescrito' | 'dispensado';

export interface Treatment {
  id: string;
  pacienteId: string;
  paciente?: PersonaResumen;
  medicoId: string;
  medico?: PersonaResumen;
  medicamento: string;
  dosis: string;
  indicaciones?: string;
  estado: EstadoTratamiento;
  fechaCreacion: string;
}

export interface CierreExpressResultado {
  turno: Appointment;
  documento: DocumentoEmitido;
  entradaClinica: MedicalRecordEntry;
}

export interface TreatmentFollowUp {
  id: string;
  treatmentId: string;
  enfermeroId: string;
  enfermero?: PersonaResumen;
  nota: string;
  fecha: string;
}

export type PrioridadTriaje = 'baja' | 'media' | 'alta' | 'critica';
export type EstadoTriaje = 'en_espera' | 'asignado' | 'atendido' | 'cancelado';

export interface TriajeCaso {
  id: string;
  pacienteId: string;
  paciente?: PersonaResumen;
  evaluadorId: string;
  evaluador?: PersonaResumen;
  observaciones: string;
  prioridad: PrioridadTriaje;
  estado: EstadoTriaje;
  medicoAsignadoId?: string;
  medicoAsignado?: PersonaResumen;
  appointmentId?: string;
  fechaCreacion: string;
  fechaAsignacion?: string;
}
