import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { obtenerDisponibilidadCruzada, reservarTurno } from '../api/appointments';
import { extraerMensajeError } from '../api/errors';
import type { Appointment, OpcionTurnoCruzado } from '../types';

interface ModalTurnoDinamicoProps {
  pacienteId: string;
  nombrePaciente: string;
  medicoId?: string;
  onClose: () => void;
  onTurnoAgendado: (turno: Appointment) => void;
}

export function ModalTurnoDinamico({
  pacienteId,
  nombrePaciente,
  medicoId,
  onClose,
  onTurnoAgendado,
}: ModalTurnoDinamicoProps) {
  const [cargando, setCargando] = useState(true);
  const [opciones, setOpciones] = useState<OpcionTurnoCruzado[]>([]);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [motivo, setMotivo] = useState('Control clínico programado');

  // Modo manual de respaldo
  const [modoManual, setModoManual] = useState(false);
  const [fechaManual, setFechaManual] = useState('');

  useEffect(() => {
    setCargando(true);
    setError(null);
    obtenerDisponibilidadCruzada(medicoId, pacienteId)
      .then((res) => {
        setOpciones(res.opciones || []);
        setMensaje(res.mensaje);
        if (res.opciones.length === 0) {
          // Si no hay opciones, abrir modo manual por defecto como fallback
          setModoManual(true);
        }
      })
      .catch((err) => {
        setError(extraerMensajeError(err, 'No se pudo calcular la disponibilidad cruzada'));
        setModoManual(true);
      })
      .finally(() => setCargando(false));
  }, [medicoId, pacienteId]);

  const onConfirmarSlot = async (opcion: OpcionTurnoCruzado) => {
    setError(null);
    setGuardando(true);
    try {
      const nuevoTurno = await reservarTurno({
        pacienteId,
        medicoId,
        fecha: opcion.fecha,
        motivo,
      });
      onTurnoAgendado(nuevoTurno);
    } catch (err) {
      setError(extraerMensajeError(err, 'Error al confirmar el turno'));
      setGuardando(false);
    }
  };

  const onSubmitManual = async (e: FormEvent) => {
    e.preventDefault();
    if (!fechaManual) return;
    setError(null);
    setGuardando(true);
    try {
      const nuevoTurno = await reservarTurno({
        pacienteId,
        medicoId,
        fecha: new Date(fechaManual).toISOString(),
        motivo,
      });
      onTurnoAgendado(nuevoTurno);
    } catch (err) {
      setError(extraerMensajeError(err, 'Error al agendar el turno manual'));
      setGuardando(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: '580px', width: '90%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0, color: 'var(--color-primary-dark)' }}>
            Agendamiento Inteligente — TURNO
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.25rem',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
            }}
          >
            ✕
          </button>
        </div>

        <p style={{ margin: '0 0 1rem', fontSize: '0.92rem', color: 'var(--color-text-muted)' }}>
          Paciente: <strong>{nombrePaciente}</strong>
        </p>

        {error && <p className="error">{error}</p>}

        <label style={{ display: 'block', marginBottom: '1rem' }}>
          Motivo de la consulta
          <input
            type="text"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Ej. Control clínico, revisión de laboratorio"
          />
        </label>

        {cargando ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-primary-dark)' }}>
              Cruzando agenda médica con disponibilidad y turnos del paciente…
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Buscando los mejores huecos libres en común de los próximos 15 días.
            </p>
          </div>
        ) : (
          <>
            {/* Opciones automáticas cruzadas */}
            {!modoManual && opciones.length > 0 && (
              <div>
                <p style={{ fontWeight: 600, margin: '0 0 0.75rem', fontSize: '0.95rem' }}>
                  Opciones sugeridas por disponibilidad cruzada:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {opciones.map((op, idx) => (
                    <div
                      key={op.fecha}
                      style={{
                        background: '#f0fdf4',
                        border: '1px solid #86efac',
                        borderRadius: 8,
                        padding: '1rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '1rem',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: '#166534' }}>
                          {op.fechaFormateada}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#15803d', marginTop: '0.2rem' }}>
                          Opción {idx + 1} — 100% libre para médico y paciente
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onConfirmarSlot(op)}
                        disabled={guardando}
                        style={{
                          background: '#15803d',
                          color: '#ffffff',
                          border: 'none',
                          padding: '0.55rem 1rem',
                          borderRadius: 6,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {guardando ? 'Agendando…' : 'Confirmar turno'}
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setModoManual(true)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--color-text-muted)',
                      textDecoration: 'underline',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    ¿Preferís elegir otra fecha a mano? Cambiar a agendamiento manual
                  </button>
                </div>
              </div>
            )}

            {/* Fallback / Modo manual */}
            {(modoManual || opciones.length === 0) && (
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: 8,
                  padding: '1rem',
                  marginTop: '0.5rem',
                }}
              >
                {opciones.length === 0 && (
                  <div
                    style={{
                      background: '#fffbeb',
                      border: '1px solid #fcd34d',
                      color: '#92400e',
                      padding: '0.75rem',
                      borderRadius: 6,
                      marginBottom: '1rem',
                      fontSize: '0.88rem',
                    }}
                  >
                    {mensaje ||
                      'No se encontraron huecos libres en común dentro de los próximos 15 días. Podés utilizar el agendamiento manual como respaldo.'}
                  </div>
                )}

                <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem' }}>
                  Agendamiento manual de respaldo
                </h3>

                <form onSubmit={onSubmitManual}>
                  <label style={{ display: 'block', marginBottom: '0.75rem' }}>
                    Seleccionar fecha y hora
                    <input
                      type="datetime-local"
                      value={fechaManual}
                      onChange={(e) => setFechaManual(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      required
                    />
                  </label>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button type="submit" disabled={guardando || !fechaManual}>
                      {guardando ? 'Guardando…' : 'Agendar turno manualmente'}
                    </button>
                    {opciones.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setModoManual(false)}
                        style={{
                          background: 'transparent',
                          border: '1px solid var(--color-border)',
                          color: 'var(--color-text)',
                        }}
                      >
                        Volver a opciones inteligentes
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
