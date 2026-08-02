import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import {
  confirmarTranscripcion,
  generarTranscripcion,
  listarTranscripciones,
} from '../../api/ambientAi';
import { extraerMensajeError } from '../../api/errors';
import type { TranscripcionConsulta } from '../../types';

export function AmbientAiPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  // undefined = todavía cargando, null = confirmado que no existe
  const [transcripcion, setTranscripcion] = useState<TranscripcionConsulta | null | undefined>(
    undefined,
  );
  const [diagnostico, setDiagnostico] = useState('');
  const [notasFinales, setNotasFinales] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [generando, setGenerando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  const cargar = () => {
    if (!appointmentId) return;
    listarTranscripciones()
      .then((lista) => {
        const encontrada = lista.find((t) => t.appointmentId === appointmentId) ?? null;
        setTranscripcion(encontrada);
        if (encontrada) setNotasFinales(encontrada.resumen);
      })
      .catch(() => setTranscripcion(null));
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentId]);

  const onGenerar = async () => {
    if (!appointmentId) return;
    setError(null);
    setGenerando(true);
    try {
      const nueva = await generarTranscripcion(appointmentId);
      setTranscripcion(nueva);
      setNotasFinales(nueva.resumen);
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo generar la transcripción'));
    } finally {
      setGenerando(false);
    }
  };

  const onConfirmar = async (e: FormEvent) => {
    e.preventDefault();
    if (!transcripcion) return;
    setError(null);
    setConfirmando(true);
    try {
      const actualizada = await confirmarTranscripcion(
        transcripcion.id,
        diagnostico,
        notasFinales || undefined,
      );
      setTranscripcion(actualizada);
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo confirmar la transcripción'));
    } finally {
      setConfirmando(false);
    }
  };

  if (transcripcion === undefined) return <p>Cargando…</p>;

  return (
    <div>
      <h1>Transcripción ambiental (IA)</h1>
      {error && <p className="error">{error}</p>}

      {!transcripcion && (
        <div className="inline-form">
          <p>Todavía no se generó una transcripción para este turno.</p>
          <button disabled={generando} onClick={onGenerar}>
            {generando ? 'Generando…' : 'Generar transcripción'}
          </button>
        </div>
      )}

      {transcripcion && (
        <>
          <div className="stat-card">
            <h2>Transcripción</h2>
            <p>{transcripcion.transcripcionCruda}</p>
          </div>

          <div className="stat-card">
            <h2>Resumen generado</h2>
            <p>{transcripcion.resumen}</p>
            <ul>
              {transcripcion.puntosClave.map((punto, i) => (
                <li key={i}>{punto}</li>
              ))}
            </ul>
          </div>

          {transcripcion.medicalRecordId ? (
            <p>✅ Confirmada — ya se generó la entrada en la historia clínica.</p>
          ) : (
            <form className="inline-form" onSubmit={onConfirmar}>
              <h2>Confirmar y guardar en historia clínica</h2>
              <label>
                Diagnóstico
                <input
                  value={diagnostico}
                  onChange={(e) => setDiagnostico(e.target.value)}
                  required
                />
              </label>
              <label>
                Notas finales (podés editar el resumen antes de guardarlo)
                <textarea
                  value={notasFinales}
                  onChange={(e) => setNotasFinales(e.target.value)}
                  rows={4}
                />
              </label>
              <button type="submit" disabled={confirmando}>
                {confirmando ? 'Guardando…' : 'Confirmar'}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
