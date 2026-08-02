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

export interface Medico {
  id: string;
  nombre: string;
  apellido: string;
}

export type EstadoTurno = 'pendiente' | 'cancelado' | 'cerrado';
export type EstadoLiquidacion = 'no_aplica' | 'pendiente';

export interface Appointment {
  id: string;
  pacienteId: string;
  medicoId: string;
  medico?: Medico;
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
  medicoId: string;
  medico?: Medico;
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
