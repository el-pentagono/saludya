import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { EstadoOrdenEstudio } from '../../common/enums/estado-orden-estudio.enum';
import { EstadoTratamiento } from '../../common/enums/estado-tratamiento.enum';
import { EstadoTriaje } from '../../common/enums/estado-triaje.enum';
import { EstadoTurno } from '../../common/enums/estado-turno.enum';
import { PrioridadTriaje } from '../../common/enums/prioridad-triaje.enum';
import { Rol } from '../../common/enums/rol.enum';
import { TranscripcionConsulta } from '../ambient-ai/entities/transcripcion-consulta.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { BloqueDisponibilidad } from '../disponibilidad/entities/bloque-disponibilidad.entity';
import { ConsentimientoMenor } from '../familia/entities/consentimiento-menor.entity';
import { MenorACargo } from '../familia/entities/menor-a-cargo.entity';
import { MedicalRecord } from '../medical-records/entities/medical-record.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { StudyOrder } from '../study-orders/entities/study-order.entity';
import { TreatmentFollowUp } from '../treatments/entities/treatment-follow-up.entity';
import { Treatment } from '../treatments/entities/treatment.entity';
import { TriajeCritico } from '../triaje-critico/entities/triaje-critico.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';

export const DEMO_PASSWORD = 'SaludYaDemo2026!';

export const DEMO_USERS = [
  {
    email: 'demo.paciente@saludya.com.ar',
    nombre: 'Lucas',
    apellido: 'Benítez',
    dni: '38123456',
    rol: Rol.PACIENTE,
  },
  {
    email: 'demo.medico@saludya.com.ar',
    nombre: 'Santiago',
    apellido: 'Navarro',
    dni: '29876543',
    rol: Rol.MEDICO,
  },
  {
    email: 'demo.enfermero@saludya.com.ar',
    nombre: 'Mariana',
    apellido: 'Pérez',
    dni: '33456789',
    rol: Rol.ENFERMERO,
  },
  {
    email: 'demo.farmaceutico@saludya.com.ar',
    nombre: 'Gustavo',
    apellido: 'Delgado',
    dni: '26789012',
    rol: Rol.FARMACEUTICO,
  },
  {
    email: 'demo.director@saludya.com.ar',
    nombre: 'Elena',
    apellido: 'Roldán',
    dni: '20123987',
    rol: Rol.DIRECTOR,
  },
  {
    email: 'demo.auditor@saludya.com.ar',
    nombre: 'Martín',
    apellido: 'Vallejos',
    dni: '24567890',
    rol: Rol.AUDITOR,
  },
];

@Injectable()
export class DemoSeedService implements OnModuleInit {
  private readonly logger = new Logger(DemoSeedService.name);

  constructor(
    @InjectRepository(Usuario) private readonly usuariosRepo: Repository<Usuario>,
    @InjectRepository(Appointment) private readonly appointmentsRepo: Repository<Appointment>,
    @InjectRepository(MedicalRecord) private readonly recordsRepo: Repository<MedicalRecord>,
    @InjectRepository(StudyOrder) private readonly studyOrdersRepo: Repository<StudyOrder>,
    @InjectRepository(Treatment) private readonly treatmentsRepo: Repository<Treatment>,
    @InjectRepository(TreatmentFollowUp)
    private readonly followUpsRepo: Repository<TreatmentFollowUp>,
    @InjectRepository(TriajeCritico) private readonly triageRepo: Repository<TriajeCritico>,
    @InjectRepository(Notification) private readonly notificationsRepo: Repository<Notification>,
    @InjectRepository(TranscripcionConsulta)
    private readonly ambientRepo: Repository<TranscripcionConsulta>,
    @InjectRepository(BloqueDisponibilidad)
    private readonly availabilityRepo: Repository<BloqueDisponibilidad>,
    @InjectRepository(ConsentimientoMenor)
    private readonly consentimientoRepo: Repository<ConsentimientoMenor>,
    @InjectRepository(MenorACargo)
    private readonly menoresRepo: Repository<MenorACargo>,
  ) {}

  async onModuleInit() {
    try {
      await this.sembrarDatosDemo();
    } catch (err) {
      this.logger.warn(`Error al sembrar datos demo: ${err.message}`);
    }
  }

  async sembrarDatosDemo() {
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
    const usuariosMap: Record<string, Usuario> = {};

    for (const u of DEMO_USERS) {
      let existente = await this.usuariosRepo.findOne({ where: { email: u.email } });
      if (!existente) {
        existente = await this.usuariosRepo.save(
          this.usuariosRepo.create({
            ...u,
            password: passwordHash,
            activo: true,
          }),
        );
        this.logger.log(`Usuario demo sembrado: ${u.email} (${u.rol})`);
      }
      usuariosMap[u.rol] = existente;
    }

    const paciente = usuariosMap[Rol.PACIENTE];
    const medico = usuariosMap[Rol.MEDICO];
    const enfermero = usuariosMap[Rol.ENFERMERO];
    const farmaceutico = usuariosMap[Rol.FARMACEUTICO];

    if (!paciente || !medico) return;

    // 1. Turnos de muestra
    let turno1 = await this.appointmentsRepo.findOne({
      where: { pacienteId: paciente.id, motivo: 'Control clínico anual y revisión de estudios' },
    });
    if (!turno1) {
      const fechaTurno = new Date();
      fechaTurno.setHours(fechaTurno.getHours() + 2);
      turno1 = await this.appointmentsRepo.save(
        this.appointmentsRepo.create({
          pacienteId: paciente.id,
          medicoId: medico.id,
          fecha: fechaTurno,
          motivo: 'Control clínico anual y revisión de estudios',
          estado: EstadoTurno.PENDIENTE,
        }),
      );
      this.logger.log('Turno demo 1 creado');
    }

    let turno2 = await this.appointmentsRepo.findOne({
      where: { pacienteId: paciente.id, motivo: 'Evaluación inicial de tensión arterial' },
    });
    if (!turno2) {
      const fechaPasada = new Date();
      fechaPasada.setDate(fechaPasada.getDate() - 1);
      turno2 = await this.appointmentsRepo.save(
        this.appointmentsRepo.create({
          pacienteId: paciente.id,
          medicoId: medico.id,
          fecha: fechaPasada,
          motivo: 'Evaluación inicial de tensión arterial',
          estado: EstadoTurno.CERRADO,
        }),
      );
      this.logger.log('Turno demo 2 creado');
    }

    // 2. Historia clínica
    let record1 = await this.recordsRepo.findOne({
      where: {
        pacienteId: paciente.id,
        diagnostico: 'Hipertensión arterial esencial estadio 1',
      },
    });
    if (!record1) {
      record1 = await this.recordsRepo.save(
        this.recordsRepo.create({
          pacienteId: paciente.id,
          medicoId: medico.id,
          diagnostico: 'Hipertensión arterial esencial estadio 1',
          notas:
            'Paciente presenta cifras de PA 145/95 mmHg en reposo. Se inicia tratamiento con Enalapril 10mg y pauta higiénico-dietética hiposódica. Se solicita ecocardiograma doppler y laboratorio completo.',
          fecha: new Date(),
        }),
      );
      this.logger.log('Historia clínica demo sembrada');
    }

    // 3. Órdenes de estudio
    let estudio1 = await this.studyOrdersRepo.findOne({
      where: { pacienteId: paciente.id, tipoEstudio: 'Ecocardiograma Doppler Color' },
    });
    if (!estudio1) {
      const fechaSugerida = new Date();
      fechaSugerida.setDate(fechaSugerida.getDate() + 3);
      estudio1 = await this.studyOrdersRepo.save(
        this.studyOrdersRepo.create({
          pacienteId: paciente.id,
          medicoId: medico.id,
          appointmentId: turno1?.id,
          tipoEstudio: 'Ecocardiograma Doppler Color',
          lugar: 'Hospital Central de Tigre',
          fechaSugerida,
          indicaciones: 'Control de función ventricular e hipertrofia concéntrica',
          estado: EstadoOrdenEstudio.PENDIENTE,
        }),
      );
      this.logger.log('Orden de estudio demo 1 sembrada');
    }

    let estudio2 = await this.studyOrdersRepo.findOne({
      where: { pacienteId: paciente.id, tipoEstudio: 'Laboratorio de Sangre y Perfil Lipídico' },
    });
    if (!estudio2) {
      const fechaPasada = new Date();
      fechaPasada.setDate(fechaPasada.getDate() - 2);
      estudio2 = await this.studyOrdersRepo.save(
        this.studyOrdersRepo.create({
          pacienteId: paciente.id,
          medicoId: medico.id,
          appointmentId: turno2?.id,
          tipoEstudio: 'Laboratorio de Sangre y Perfil Lipídico',
          lugar: 'Centro de Diagnóstico San Fernando',
          fechaSugerida: fechaPasada,
          indicaciones: 'Perfil lipídico, glucemia y función renal',
          estado: EstadoOrdenEstudio.REALIZADO,
          fechaRealizado: fechaPasada,
        }),
      );
      this.logger.log('Orden de estudio demo 2 sembrada');
    }

    // 4. Tratamientos y Recetas
    let tratamiento1 = await this.treatmentsRepo.findOne({
      where: { pacienteId: paciente.id, medicamento: 'Enalapril 10mg' },
    });
    if (!tratamiento1) {
      tratamiento1 = await this.treatmentsRepo.save(
        this.treatmentsRepo.create({
          pacienteId: paciente.id,
          medicoId: medico.id,
          appointmentId: turno1?.id,
          medicamento: 'Enalapril 10mg',
          dosis: '1 comprimido cada 12 horas',
          cantidad: '60 comprimidos',
          indicaciones: 'Tomar con abundante agua preferentemente por la mañana y noche con comida.',
          esGratuita: true,
          estado: EstadoTratamiento.PRESCRITO,
        }),
      );
      this.logger.log('Tratamiento demo 1 (para dispensar en farmacia) sembrado');
    }

    let tratamiento2 = await this.treatmentsRepo.findOne({
      where: { pacienteId: paciente.id, medicamento: 'Amoxicilina 500mg' },
    });
    if (!tratamiento2) {
      const fechaDispensa = new Date();
      fechaDispensa.setDate(fechaDispensa.getDate() - 5);
      tratamiento2 = await this.treatmentsRepo.save(
        this.treatmentsRepo.create({
          pacienteId: paciente.id,
          medicoId: medico.id,
          farmaceuticoId: farmaceutico?.id,
          appointmentId: turno2?.id,
          medicamento: 'Amoxicilina 500mg',
          dosis: '1 comprimido cada 8 horas por 7 días',
          cantidad: '21 comprimidos',
          indicaciones: 'Completar los 7 días continuos de tratamiento antibiótico.',
          esGratuita: true,
          estado: EstadoTratamiento.DISPENSADO,
          fechaDispensa,
        }),
      );
      this.logger.log('Tratamiento demo 2 (ya dispensado) sembrado');
    }

    // 5. Seguimiento de enfermería
    if (enfermero && tratamiento1) {
      const segExistente = await this.followUpsRepo.findOne({
        where: { treatmentId: tratamiento1.id },
      });
      if (!segExistente) {
        await this.followUpsRepo.save(
          this.followUpsRepo.create({
            treatmentId: tratamiento1.id,
            enfermeroId: enfermero.id,
            nota: 'Control ambulatorio: paciente refiere excelente tolerancia al antihipertensivo, sin mareos. Tensión arterial registrada: 125/80 mmHg.',
          }),
        );
        this.logger.log('Seguimiento de enfermería demo sembrado');
      }
    }

    // 6. Triaje crítico
    if (enfermero) {
      const triajeExistente = await this.triageRepo.findOne({
        where: { pacienteId: paciente.id, observaciones: 'Ingreso a guardia por cefalea frontal de 24 hs de evolución' },
      });
      if (!triajeExistente) {
        await this.triageRepo.save(
          this.triageRepo.create({
            pacienteId: paciente.id,
            evaluadorId: enfermero.id,
            prioridad: PrioridadTriaje.MEDIA,
            estado: EstadoTriaje.EN_ESPERA,
            observaciones: 'Ingreso a guardia por cefalea frontal de 24 hs de evolución',
          }),
        );
        this.logger.log('Caso de triaje demo sembrado');
      }
    }

    // 7. Notificaciones de demo
    const notifExistente = await this.notificationsRepo.findOne({
      where: { usuarioId: paciente.id, titulo: 'Receta digital disponible para retirar' },
    });
    if (!notifExistente) {
      await this.notificationsRepo.save([
        this.notificationsRepo.create({
          usuarioId: paciente.id,
          tipo: 'receta_emitida',
          titulo: 'Receta digital disponible para retirar',
          mensaje:
            'Tenés disponible para retirar en farmacia: Enalapril 10mg (60 comprimidos). Cobertura: 100% Gratuita (Plan Remediar).',
          leida: false,
        }),
        this.notificationsRepo.create({
          usuarioId: paciente.id,
          tipo: 'orden_estudio_emitida',
          titulo: 'Nueva orden de estudio médico',
          mensaje:
            'El Dr. Santiago Navarro te asignó: Ecocardiograma Doppler Color en Hospital Central de Tigre.',
          leida: false,
        }),
      ]);
      this.logger.log('Notificaciones demo sembradas');
    }

    // 8. Ambient AI Transcripción
    if (turno2) {
      const ambientExistente = await this.ambientRepo.findOne({
        where: { appointmentId: turno2.id },
      });
      if (!ambientExistente) {
        await this.ambientRepo.save(
          this.ambientRepo.create({
            appointmentId: turno2.id,
            medicoId: medico.id,
            pacienteId: paciente.id,
            transcripcionCruda:
              'Médico: Buen día Lucas, contame cómo venís con la presión arterial.\nPaciente: Hola doctor, estuve registrando valores altos, especialmente a la mañana.\nMédico: Vamos a tomarla ahora... sí, 145/95. Te voy a indicar Enalapril 10mg cada 12 horas y pedimos un ecocardiograma.',
            resumen:
              'Paciente masculino de 38 años consulta por registros tensionales elevados. Se constata PA 145/95 mmHg. Se inicia Enalapril 10mg c/12h y se solicitan estudios complementarios.',
            puntosClave: [
              'Registro tensional en consulta: 145/95 mmHg',
              'Inicio de Enalapril 10mg cada 12 horas',
              'Solicitud de Ecocardiograma Doppler y laboratorio',
            ],
            medicalRecordId: record1?.id,
            fechaConfirmacion: new Date(),
          }),
        );
        this.logger.log('Transcripción Ambient AI demo sembrada');
      }
    }

    // 9. Bloques personales de disponibilidad del paciente demo
    const bloquesExistentes = await this.availabilityRepo.find({
      where: { pacienteId: paciente.id },
    });
    if (bloquesExistentes.length === 0) {
      await this.availabilityRepo.save([
        this.availabilityRepo.create({
          pacienteId: paciente.id,
          titulo: 'Trabajo en oficina (Tigre)',
          esRecurrente: true,
          diaSemana: 1, // Lunes
          horaInicio: '08:00',
          horaFin: '13:00',
        }),
        this.availabilityRepo.create({
          pacienteId: paciente.id,
          titulo: 'Cuidado familiar y clases',
          esRecurrente: true,
          diaSemana: 3, // Miércoles
          horaInicio: '14:00',
          horaFin: '18:00',
        }),
      ]);
      this.logger.log('Bloques de disponibilidad personal demo sembrados');
    }

    // 10. Consentimiento y Perfil de Menor a Cargo (Gestión Familiar)
    let consentimientoDemo = await this.consentimientoRepo.findOne({
      where: { tutorId: paciente.id },
    });
    if (!consentimientoDemo) {
      consentimientoDemo = await this.consentimientoRepo.save(
        this.consentimientoRepo.create({
          tutorId: paciente.id,
          versionPolitica: '1.0',
          textoAceptado:
            'Acepto expresamente que SaludYa almacene y procese los datos de salud de los menores a mi cargo conforme a la Ley de Protección de Datos Personales y políticas de Google Play Store para el cuidado pediátrico.',
          ipAddress: '127.0.0.1',
        }),
      );
      this.logger.log('Consentimiento informado de menores demo sembrado');
    }

    const menorExistente = await this.menoresRepo.findOne({
      where: { tutorId: paciente.id, nombre: 'Sofía' },
    });
    if (!menorExistente) {
      await this.menoresRepo.save(
        this.menoresRepo.create({
          tutorId: paciente.id,
          nombre: 'Sofía',
          apellido: 'Benítez',
          dni: '54123987',
          fechaNacimiento: '2019-05-14',
          relacion: 'padre',
          grupoSanguineo: '0+',
          alergias: 'Ninguna alergia conocida. Vacunas de ingreso escolar completas.',
          antecedentes: 'Broncoespasmo leve a los 3 años (resuelto). Controles anuales normales.',
          pediatraCabecera: 'Dra. Laura Rossi (Hospital Materno Infantil de Tigre)',
          documentoRespaldoUrl:
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          documentoRespaldoNombre: 'dni-sofia-benitez.jpg',
          documentoRespaldoTipo: 'dni',
          estadoVerificacion: 'documentado',
        }),
      );
      this.logger.log('Perfil de menor demo (Sofía Benítez) sembrado');
    }
  }
}
