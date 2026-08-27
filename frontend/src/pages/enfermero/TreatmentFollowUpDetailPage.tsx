import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { extraerMensajeError } from '../../api/errors';
import { agregarSeguimiento, listarSeguimientos, obtenerTratamientoPorId } from '../../api/treatments';
import type { Treatment, TreatmentFollowUp } from '../../types';

export function TreatmentFollowUpDetailPage() {
  const { treatmentId } = useParams<{ treatmentId: string }>();
  const [tratamiento, setTratamiento] = useState<Treatment | null>(null);
  const [seguimientos, setSeguimientos] = useState<TreatmentFollowUp[]>([]);
  const [nota, setNota] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const cargar = () => {
    if (!treatmentId) return;
    obtenerTratamientoPorId(treatmentId)
      .then(setTratamiento)
      .catch(() => setTratamiento(null));

    listarSeguimientos(treatmentId)
      .then(setSeguimientos)
      .catch((err) => setError(extraerMensajeError(err, 'No se pudo cargar el seguimiento')));
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treatmentId]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!treatmentId) return;
    setError(null);
    setEnviando(true);
    try {
      await agregarSeguimiento(treatmentId, nota);
      setNota('');
      cargar();
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo agregar la nota'));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <Link
          to="/enfermero/tratamientos"
          style={{ textDecoration: 'none', color: 'var(--color-primary-dark)', fontWeight: 600 }}
        >
          ← Volver a lista de tratamientos
        </Link>
      </div>

      <h1>Seguimiento de Medicación y Tratamiento</h1>

      {/* Ficha clínica del tratamiento */}
      {tratamiento && (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid var(--color-border)',
            borderRadius: 10,
            padding: '1.25rem',
            marginBottom: '1.5rem',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ margin: '0 0 0.25rem', color: 'var(--color-primary-dark)' }}>
                {tratamiento.medicamento} — {tratamiento.dosis}
              </h2>
              <p style={{ margin: '0.2rem 0', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                Paciente:{' '}
                <strong>
                  {tratamiento.paciente ? `${tratamiento.paciente.nombre} ${tratamiento.paciente.apellido}` : '—'}
                </strong>
                {tratamiento.medico && ` • Médico: Dr/a. ${tratamiento.medico.nombre} ${tratamiento.medico.apellido}`}
              </p>
            </div>
            <div>
              <span className={`badge badge-${tratamiento.estado}`}>
                {tratamiento.estado === 'prescrito' ? 'Prescrito / Pendiente retiro' : 'Dispensado en farmacia'}
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginTop: '1rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--color-border)',
              fontSize: '0.88rem',
            }}
          >
            <div>
              <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>Cantidad indicada:</span>
              <strong>{tratamiento.cantidad || '1 unidad'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>Cobertura:</span>
              <strong>{tratamiento.esGratuita ? '100% Gratuito (Remediar)' : 'Cobertura estándar'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>Fecha prescripción:</span>
              <strong>{new Date(tratamiento.fechaCreacion).toLocaleDateString('es-AR')}</strong>
            </div>
            {tratamiento.fechaDispensa && (
              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>Fecha entrega en farmacia:</span>
                <strong>{new Date(tratamiento.fechaDispensa).toLocaleDateString('es-AR')}</strong>
              </div>
            )}
          </div>

          {tratamiento.indicaciones && (
            <div style={{ marginTop: '0.75rem', background: '#f8fafc', padding: '0.75rem', borderRadius: 6, fontSize: '0.88rem' }}>
              <strong>Indicaciones médicas:</strong> {tratamiento.indicaciones}
            </div>
          )}
        </div>
      )}

      {/* Formulario de registro de notas de enfermería */}
      <form className="inline-form" onSubmit={onSubmit}>
        <h2>Registrar nota de evolución / seguimiento</h2>
        {error && <p className="error">{error}</p>}
        <label>
          Observaciones de enfermería (tolerancia gástrica, efectos adversos, apego al tratamiento)
          <textarea
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            rows={3}
            placeholder="Ej: Paciente refiere buena tolerancia, toma la medicación según pauta. TA: 120/80."
            required
          />
        </label>
        <button type="submit" disabled={enviando}>
          {enviando ? 'Guardando…' : 'Agregar nota de seguimiento'}
        </button>
      </form>

      <h2>Historial de notas de seguimiento</h2>
      <ul className="lista-entradas">
        {seguimientos.map((s) => (
          <li key={s.id}>
            <strong>{new Date(s.fecha).toLocaleString('es-AR')}</strong>
            {s.enfermero && (
              <span className="detalle">
                {' '}
                — Lic. {s.enfermero.nombre} {s.enfermero.apellido}
              </span>
            )}
            <p className="notas">{s.nota}</p>
          </li>
        ))}
        {seguimientos.length === 0 && <li>Todavía no hay notas de seguimiento registradas.</li>}
      </ul>
    </div>
  );
}
