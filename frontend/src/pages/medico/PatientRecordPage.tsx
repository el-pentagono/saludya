import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { crearEntradaHistoriaClinica, listarHistoriaClinica } from '../../api/medicalRecords';
import { extraerMensajeError } from '../../api/errors';
import type { MedicalRecordEntry } from '../../types';

export function PatientRecordPage() {
  const { pacienteId } = useParams<{ pacienteId: string }>();
  const [entradas, setEntradas] = useState<MedicalRecordEntry[]>([]);
  const [diagnostico, setDiagnostico] = useState('');
  const [notas, setNotas] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const cargar = () => {
    if (!pacienteId) return;
    listarHistoriaClinica(pacienteId)
      .then(setEntradas)
      .catch((err) => setError(extraerMensajeError(err, 'No se pudo cargar la historia clínica')));
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pacienteId]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!pacienteId) return;
    setError(null);
    setEnviando(true);
    try {
      await crearEntradaHistoriaClinica({ pacienteId, diagnostico, notas: notas || undefined });
      setDiagnostico('');
      setNotas('');
      cargar();
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo guardar la entrada'));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div>
      <h1>Historia clínica del paciente</h1>

      <form className="inline-form" onSubmit={onSubmit}>
        <h2>Agregar entrada</h2>
        {error && <p className="error">{error}</p>}
        <label>
          Diagnóstico
          <input value={diagnostico} onChange={(e) => setDiagnostico(e.target.value)} required />
        </label>
        <label>
          Notas (opcional)
          <textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={3} />
        </label>
        <button type="submit" disabled={enviando}>
          {enviando ? 'Guardando…' : 'Guardar entrada'}
        </button>
      </form>

      <ul className="lista-entradas">
        {entradas.map((e) => (
          <li key={e.id}>
            <strong>{new Date(e.fecha).toLocaleDateString('es-AR')}</strong> — {e.diagnostico}
            {e.notas && <p className="notas">{e.notas}</p>}
          </li>
        ))}
        {entradas.length === 0 && <li>Todavía no hay entradas en esta historia clínica.</li>}
      </ul>
    </div>
  );
}
