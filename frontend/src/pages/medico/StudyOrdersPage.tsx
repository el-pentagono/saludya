import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { extraerMensajeError } from '../../api/errors';
import { listarOrdenesEstudio, marcarEstudioRealizado } from '../../api/studyOrders';
import type { StudyOrder } from '../../types';

export function StudyOrdersPage() {
  const [ordenes, setOrdenes] = useState<StudyOrder[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Modal para marcar estudio como realizado
  const [ordenRealizando, setOrdenRealizando] = useState<StudyOrder | null>(null);
  const [fechaControl, setFechaControl] = useState('');
  const [enviando, setEnviando] = useState(false);

  const cargar = () => {
    listarOrdenesEstudio()
      .then(setOrdenes)
      .catch(() => setOrdenes([]));
  };

  useEffect(() => {
    cargar();
  }, []);

  const abrirModalRealizar = (orden: StudyOrder) => {
    setError(null);
    setMensajeExito(null);
    setOrdenRealizando(orden);
    // Sugerir control en 7 días a las 10:00 hs
    const fecha = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    fecha.setHours(10, 0, 0, 0);
    setFechaControl(fecha.toISOString().slice(0, 16));
  };

  const confirmarRealizado = async (e: FormEvent) => {
    e.preventDefault();
    if (!ordenRealizando) return;
    setError(null);
    setEnviando(true);
    try {
      await marcarEstudioRealizado(ordenRealizando.id, {
        fechaControlSugerida: new Date(fechaControl).toISOString(),
      });
      setOrdenRealizando(null);
      setMensajeExito(
        `Estudio "${ordenRealizando.tipoEstudio}" marcado como realizado. Se notificó al paciente la sugerencia de turno de control.`,
      );
      cargar();
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo actualizar el estado del estudio'));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div>
      <h1>Órdenes de estudio médico</h1>
      {error && <p className="error">{error}</p>}
      {mensajeExito && (
        <div
          style={{
            background: '#ecfdf5',
            color: '#065f46',
            border: '1px solid #a7f3d0',
            padding: '0.75rem 1rem',
            borderRadius: 8,
            marginBottom: '1rem',
            fontSize: '0.9rem',
          }}
        >
          ✓ {mensajeExito}
        </div>
      )}

      <table className="tabla">
        <thead>
          <tr>
            <th>Fecha sugerida</th>
            <th>Paciente</th>
            <th>Estudio</th>
            <th>Lugar</th>
            <th>Estado</th>
            <th>Control sugerido</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {ordenes.map((o) => (
            <tr key={o.id}>
              <td>{new Date(o.fechaSugerida).toLocaleString('es-AR')}</td>
              <td>{o.paciente ? `${o.paciente.nombre} ${o.paciente.apellido}` : '—'}</td>
              <td>
                <strong>{o.tipoEstudio}</strong>
                {o.indicaciones && (
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    {o.indicaciones}
                  </span>
                )}
              </td>
              <td>{o.lugar}</td>
              <td>
                <span className={`badge badge-${o.estado}`}>{o.estado}</span>
              </td>
              <td>
                {o.fechaControlSugerida
                  ? new Date(o.fechaControlSugerida).toLocaleDateString('es-AR')
                  : '—'}
              </td>
              <td>
                {o.estado === 'pendiente' && (
                  <button
                    type="button"
                    style={{ background: '#059669', fontSize: '0.85rem' }}
                    onClick={() => abrirModalRealizar(o)}
                  >
                    Marcar realizado
                  </button>
                )}
              </td>
            </tr>
          ))}
          {ordenes.length === 0 && (
            <tr>
              <td colSpan={7}>No hay órdenes de estudio emitidas.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal para marcar estudio como realizado */}
      {ordenRealizando && (
        <div className="modal-overlay" onClick={() => setOrdenRealizando(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Marcar estudio como realizado</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginTop: 0 }}>
              Estudio: <strong>{ordenRealizando.tipoEstudio}</strong>
              <br />
              Paciente:{' '}
              <strong>
                {ordenRealizando.paciente
                  ? `${ordenRealizando.paciente.nombre} ${ordenRealizando.paciente.apellido}`
                  : 'Paciente'}
              </strong>
            </p>

            <form onSubmit={confirmarRealizado}>
              <label>
                Fecha y hora sugerida para el turno de control médico
                <input
                  type="datetime-local"
                  value={fechaControl}
                  onChange={(e) => setFechaControl(e.target.value)}
                  required
                />
              </label>

              <p style={{ fontSize: '0.8rem', color: '#065f46', background: '#ecfdf5', padding: '0.5rem', borderRadius: 6 }}>
                ℹ Al confirmar, el estudio quedará marcado como realizado y se disparará una notificación automática al paciente con la fecha sugerida para volver a control.
              </p>

              <div className="modal-botones">
                <button
                  type="button"
                  onClick={() => setOrdenRealizando(null)}
                  style={{ background: '#9ca3af' }}
                >
                  Cancelar
                </button>
                <button type="submit" disabled={enviando} style={{ background: '#059669' }}>
                  {enviando ? 'Guardando…' : 'Confirmar realización'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
