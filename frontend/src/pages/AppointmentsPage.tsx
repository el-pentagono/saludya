import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  cancelarTurno,
  listarTurnos,
  obtenerDisponibilidadCruzada,
  reservarTurno,
} from '../api/appointments';
import { extraerMensajeError } from '../api/errors';
import { obtenerSalaTeleconsult } from '../api/teleconsult';
import { listarMedicos } from '../api/usuarios';
import type { Appointment, Medico, OpcionTurnoCruzado } from '../types';

export function AppointmentsPage() {
  const [turnos, setTurnos] = useState<Appointment[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [medicoId, setMedicoId] = useState('');
  const [fecha, setFecha] = useState('');
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Sugerencias inteligentes de disponibilidad cruzada
  const [cargandoSugerencias, setCargandoSugerencias] = useState(false);
  const [sugerencias, setSugerencias] = useState<OpcionTurnoCruzado[]>([]);

  const cargarTurnos = () => {
    listarTurnos()
      .then(setTurnos)
      .catch(() => setTurnos([]));
  };

  useEffect(() => {
    cargarTurnos();
    listarMedicos()
      .then(setMedicos)
      .catch(() => setMedicos([]));
  }, []);

  // Al elegir un médico, calcular automáticamente las mejores opciones disponibles
  useEffect(() => {
    if (!medicoId) {
      setSugerencias([]);
      return;
    }

    setCargandoSugerencias(true);
    obtenerDisponibilidadCruzada(medicoId)
      .then((res) => setSugerencias(res.opciones || []))
      .catch(() => setSugerencias([]))
      .finally(() => setCargandoSugerencias(false));
  }, [medicoId]);

  const onSeleccionarSugerencia = (op: OpcionTurnoCruzado) => {
    // Formatear a formato local ISO requerido por datetime-local input (YYYY-MM-DDTHH:mm)
    const d = new Date(op.fecha);
    const anio = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    const horas = String(d.getHours()).padStart(2, '0');
    const minutos = String(d.getMinutes()).padStart(2, '0');
    setFecha(`${anio}-${mes}-${dia}T${horas}:${minutos}`);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await reservarTurno({
        medicoId,
        fecha: new Date(fecha).toISOString(),
        motivo: motivo || undefined,
      });
      setMedicoId('');
      setFecha('');
      setMotivo('');
      setSugerencias([]);
      cargarTurnos();
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo reservar el turno'));
    } finally {
      setEnviando(false);
    }
  };

  const onCancelar = async (id: string) => {
    setError(null);
    try {
      await cancelarTurno(id);
      cargarTurnos();
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo cancelar el turno'));
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <h1 style={{ margin: 0 }}>Mis turnos</h1>
        <Link
          to="/mi-disponibilidad"
          style={{
            background: '#f0fdf4',
            border: '1px solid #86efac',
            color: '#166534',
            padding: '0.45rem 0.85rem',
            borderRadius: 6,
            textDecoration: 'none',
            fontSize: '0.88rem',
            fontWeight: 600,
          }}
        >
          ⚙ Gestionar mi disponibilidad personal →
        </Link>
      </div>

      <form className="inline-form" onSubmit={onSubmit}>
        <h2>Reservar turno</h2>
        {error && <p className="error">{error}</p>}

        <label>
          Médico
          <select value={medicoId} onChange={(e) => setMedicoId(e.target.value)} required>
            <option value="">Elegí un médico</option>
            {medicos.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre} {m.apellido}
              </option>
            ))}
          </select>
        </label>

        {/* Sugerencias dinámicas según disponibilidad cruzada */}
        {medicoId && (
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: 8,
              padding: '0.85rem 1rem',
              margin: '0.5rem 0 1rem',
            }}
          >
            {cargandoSugerencias ? (
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Consultando disponibilidad cruzada con la agenda del profesional…
              </p>
            ) : sugerencias.length > 0 ? (
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e3a8a', marginBottom: '0.4rem' }}>
                  ✨ Horarios sugeridos según tu disponibilidad y la del médico:
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {sugerencias.map((op) => (
                    <button
                      key={op.fecha}
                      type="button"
                      onClick={() => onSeleccionarSugerencia(op)}
                      style={{
                        background: '#dbeafe',
                        border: '1px solid #93c5fd',
                        color: '#1e40af',
                        padding: '0.4rem 0.75rem',
                        fontSize: '0.82rem',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      {op.fechaFormateada}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                No hay sugerencias automáticas inmediatas. Podés seleccionar cualquier fecha y hora disponible abajo.
              </p>
            )}
          </div>
        )}

        <label>
          Fecha y hora
          <input
            type="datetime-local"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
            required
          />
        </label>

        <label>
          Motivo (opcional)
          <input value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ej. Chequeo anual, dolor de garganta" />
        </label>

        <button type="submit" disabled={enviando}>
          {enviando ? 'Reservando…' : 'Reservar'}
        </button>
      </form>

      <table className="tabla">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Médico</th>
            <th>Motivo</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {turnos.map((t) => (
            <tr key={t.id}>
              <td>{new Date(t.fecha).toLocaleString('es-AR')}</td>
              <td>{t.medico ? `${t.medico.nombre} ${t.medico.apellido}` : '—'}</td>
              <td>{t.motivo ?? '—'}</td>
              <td>
                <span className={`badge badge-${t.estado}`}>{t.estado}</span>
              </td>
              <td className="acciones">
                {t.estado === 'pendiente' && (
                  <>
                    <button onClick={() => onUnirseVideollamada(t.id)}>Videollamada</button>
                    <button onClick={() => onCancelar(t.id)}>Cancelar</button>
                  </>
                )}
              </td>
            </tr>
          ))}
          {turnos.length === 0 && (
            <tr>
              <td colSpan={5}>Todavía no tenés turnos.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
