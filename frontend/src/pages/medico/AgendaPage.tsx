import { Fragment, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { listarTurnos } from '../../api/appointments';
import { cerrarTurnoExpress } from '../../api/cierreExpress';
import { extraerMensajeError } from '../../api/errors';
import { crearOrdenEstudio } from '../../api/studyOrders';
import { obtenerSalaTeleconsult } from '../../api/teleconsult';
import { ModalTurnoDinamico } from '../../components/ModalTurnoDinamico';
import type { Appointment } from '../../types';

export function AgendaPage() {
  const [turnos, setTurnos] = useState<Appointment[]>([]);
  const [cerrandoId, setCerrandoId] = useState<string | null>(null);
  const [diagnostico, setDiagnostico] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Estado para modal de turno dinámico cruzado
  const [turnoDinamicoPaciente, setTurnoDinamicoPaciente] = useState<{
    pacienteId: string;
    nombrePaciente: string;
  } | null>(null);

  // Estado para modal de orden de estudio
  const [turnoOrdenando, setTurnoOrdenando] = useState<Appointment | null>(null);
  const [tipoEstudio, setTipoEstudio] = useState('Laboratorio de sangre completo');
  const [lugarEstudio, setLugarEstudio] = useState('Hospital Central - Laboratorio');
  const [fechaSugeridaEstudio, setFechaSugeridaEstudio] = useState('');
  const [indicacionesEstudio, setIndicacionesEstudio] = useState('');
  const [enviandoEstudio, setEnviandoEstudio] = useState(false);

  const cargar = () => {
    listarTurnos()
      .then(setTurnos)
      .catch(() => setTurnos([]));
  };

  useEffect(() => {
    cargar();
  }, []);

  const abrirCierre = (id: string) => {
    setCerrandoId(id);
    setDiagnostico('');
    setError(null);
    setMensajeExito(null);
  };

  const confirmarCierre = async (id: string) => {
    setError(null);
    setEnviando(true);
    try {
      await cerrarTurnoExpress(id, diagnostico);
      setCerrandoId(null);
      cargar();
      setMensajeExito('Turno cerrado y constancia médica generada con éxito.');
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo cerrar el turno'));
    } finally {
      setEnviando(false);
    }
  };

  const abrirOrdenEstudio = (t: Appointment) => {
    setError(null);
    setMensajeExito(null);
    setTurnoOrdenando(t);
    setTipoEstudio('Laboratorio de sangre completo');
    setLugarEstudio('Hospital Central - Laboratorio');
    // Mañana a las 08:00 hs por defecto
    const manana = new Date(Date.now() + 24 * 60 * 60 * 1000);
    manana.setHours(8, 0, 0, 0);
    setFechaSugeridaEstudio(manana.toISOString().slice(0, 16));
    setIndicacionesEstudio('Ayuno de 8 horas previo a la extracción.');
  };

  const confirmarOrdenEstudio = async (e: FormEvent) => {
    e.preventDefault();
    if (!turnoOrdenando) return;
    setError(null);
    setEnviandoEstudio(true);
    try {
      await crearOrdenEstudio({
        pacienteId: turnoOrdenando.pacienteId,
        appointmentId: turnoOrdenando.id,
        tipoEstudio,
        lugar: lugarEstudio,
        fechaSugerida: new Date(fechaSugeridaEstudio).toISOString(),
        indicaciones: indicacionesEstudio || undefined,
      });
      setTurnoOrdenando(null);
      setMensajeExito(
        `Orden de "${tipoEstudio}" emitida correctamente. Se notificó automáticamente al paciente.`,
      );
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo emitir la orden de estudio'));
    } finally {
      setEnviandoEstudio(false);
    }
  };

  const onUnirseVideollamada = async (id: string) => {
    setError(null);
    try {
      const { salaUrl } = await obtenerSalaTeleconsult(id);
      window.open(salaUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo obtener la sala de videollamada'));
    }
  };

  return (
    <div>
      <h1>Mi agenda</h1>
      {error && <p className="error">{error}</p>}
      {mensajeExito && (
        <div style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1rem', fontSize: '0.9rem' }}>
          ✓ {mensajeExito}
        </div>
      )}

      <table className="tabla">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Paciente</th>
            <th>Motivo</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {turnos.map((t) => (
            <Fragment key={t.id}>
              <tr>
                <td>{new Date(t.fecha).toLocaleString('es-AR')}</td>
                <td>{t.paciente ? `${t.paciente.nombre} ${t.paciente.apellido}` : '—'}</td>
                <td>{t.motivo ?? '—'}</td>
                <td>
                  <span className={`badge badge-${t.estado}`}>{t.estado}</span>
                </td>
                <td className="acciones">
                  {t.estado === 'pendiente' && (
                    <>
                      <button
                        type="button"
                        style={{
                          background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
                          color: '#ffffff',
                          fontWeight: 700,
                          boxShadow: '0 2px 4px rgba(22, 101, 52, 0.2)',
                        }}
                        onClick={() =>
                          setTurnoDinamicoPaciente({
                            pacienteId: t.pacienteId,
                            nombrePaciente: t.paciente
                              ? `${t.paciente.nombre} ${t.paciente.apellido}`
                              : 'Paciente',
                          })
                        }
                      >
                        📅 TURNO
                      </button>
                      <button onClick={() => onUnirseVideollamada(t.id)}>Videollamada</button>
                      <button onClick={() => abrirCierre(t.id)}>Cerrar turno</button>
                      <Link to={`/medico/pacientes/${t.pacienteId}/historia-clinica`}>
                        Historia clínica
                      </Link>
                      <button
                        type="button"
                        style={{ background: '#0284c7' }}
                        onClick={() => abrirOrdenEstudio(t)}
                      >
                        Ordenar estudio
                      </button>
                      <Link to={`/medico/pacientes/${t.pacienteId}/prescribir?appointmentId=${t.id}`}>
                        Receta digital
                      </Link>
                      <Link to={`/medico/pacientes/${t.pacienteId}/boveda-salud-mental`}>
                        Bóveda salud mental
                      </Link>
                      <Link to={`/medico/turnos/${t.id}/transcripcion`}>Transcripción IA</Link>
                    </>
                  )}
                </td>
              </tr>
              {cerrandoId === t.id && (
                <tr>
                  <td colSpan={5}>
                    <div className="cierre-inline">
                      <label>
                        Diagnóstico breve
                        <input
                          value={diagnostico}
                          onChange={(e) => setDiagnostico(e.target.value)}
                          autoFocus
                        />
                      </label>
                      <div className="cierre-inline-botones">
                        <button disabled={enviando} onClick={() => confirmarCierre(t.id)}>
                          {enviando ? 'Cerrando…' : 'Confirmar cierre'}
                        </button>
                        <button type="button" onClick={() => setCerrandoId(null)}>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
          {turnos.length === 0 && (
            <tr>
              <td colSpan={5}>No tenés turnos en tu agenda.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal de Carga de Orden de Estudio */}
      {turnoOrdenando && (
        <div className="modal-overlay" onClick={() => setTurnoOrdenando(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Emitir orden de estudio médico</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: 0 }}>
              Paciente:{' '}
              <strong>
                {turnoOrdenando.paciente
                  ? `${turnoOrdenando.paciente.nombre} ${turnoOrdenando.paciente.apellido}`
                  : 'Paciente'}
              </strong>
            </p>

            <form onSubmit={confirmarOrdenEstudio}>
              <label>
                Tipo de estudio
                <input
                  value={tipoEstudio}
                  onChange={(e) => setTipoEstudio(e.target.value)}
                  placeholder="Ej: Laboratorio de sangre completo, Radiografía de tórax..."
                  required
                />
              </label>

              <label>
                Lugar de realización sugerido
                <input
                  value={lugarEstudio}
                  onChange={(e) => setLugarEstudio(e.target.value)}
                  placeholder="Ej: Hospital Central - Laboratorio Pabellón B"
                  required
                />
              </label>

              <label>
                Fecha y hora sugerida
                <input
                  type="datetime-local"
                  value={fechaSugeridaEstudio}
                  onChange={(e) => setFechaSugeridaEstudio(e.target.value)}
                  required
                />
              </label>

              <label>
                Indicaciones médicas (opcional)
                <textarea
                  value={indicacionesEstudio}
                  onChange={(e) => setIndicacionesEstudio(e.target.value)}
                  placeholder="Ej: 8 horas de ayuno previo, traer orden impresa..."
                  rows={2}
                />
              </label>

              <p style={{ fontSize: '0.8rem', color: '#0369a1', background: '#e0f2fe', padding: '0.5rem', borderRadius: 6 }}>
                ℹ Al emitir la orden, el paciente recibirá automáticamente una notificación con el día, hora y lugar asignados.
              </p>

              <div className="modal-botones">
                <button type="button" onClick={() => setTurnoOrdenando(null)} style={{ background: '#9ca3af' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={enviandoEstudio} style={{ background: '#0284c7' }}>
                  {enviandoEstudio ? 'Emitiendo orden…' : 'Emitir y Notificar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {turnoDinamicoPaciente && (
        <ModalTurnoDinamico
          pacienteId={turnoDinamicoPaciente.pacienteId}
          nombrePaciente={turnoDinamicoPaciente.nombrePaciente}
          onClose={() => setTurnoDinamicoPaciente(null)}
          onTurnoAgendado={(nuevo) => {
            setTurnoDinamicoPaciente(null);
            cargar();
            setMensajeExito(
              `Turno agendado exitosamente para el ${new Date(nuevo.fecha).toLocaleString('es-AR')}.`,
            );
          }}
        />
      )}
    </div>
  );
}
