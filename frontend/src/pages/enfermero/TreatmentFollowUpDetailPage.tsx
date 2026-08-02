import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { agregarSeguimiento, listarSeguimientos } from '../../api/treatments';
import { extraerMensajeError } from '../../api/errors';
import type { TreatmentFollowUp } from '../../types';

export function TreatmentFollowUpDetailPage() {
  const { treatmentId } = useParams<{ treatmentId: string }>();
  const [seguimientos, setSeguimientos] = useState<TreatmentFollowUp[]>([]);
  const [nota, setNota] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const cargar = () => {
    if (!treatmentId) return;
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
      <h1>Seguimiento del tratamiento</h1>

      <form className="inline-form" onSubmit={onSubmit}>
        {error && <p className="error">{error}</p>}
        <label>
          Nota de seguimiento
          <textarea value={nota} onChange={(e) => setNota(e.target.value)} rows={3} required />
        </label>
        <button type="submit" disabled={enviando}>
          {enviando ? 'Guardando…' : 'Agregar nota'}
        </button>
      </form>

      <ul className="lista-entradas">
        {seguimientos.map((s) => (
          <li key={s.id}>
            <strong>{new Date(s.fecha).toLocaleString('es-AR')}</strong>
            {s.enfermero && (
              <span className="detalle">
                {' '}
                — {s.enfermero.nombre} {s.enfermero.apellido}
              </span>
            )}
            <p className="notas">{s.nota}</p>
          </li>
        ))}
        {seguimientos.length === 0 && <li>Todavía no hay notas de seguimiento.</li>}
      </ul>
    </div>
  );
}
