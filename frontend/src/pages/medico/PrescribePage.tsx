import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { extraerMensajeError } from '../../api/errors';
import { prescribirTratamiento } from '../../api/treatments';

export function PrescribePage() {
  const { pacienteId } = useParams<{ pacienteId: string }>();
  const navigate = useNavigate();
  const [medicamento, setMedicamento] = useState('');
  const [dosis, setDosis] = useState('');
  const [indicaciones, setIndicaciones] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!pacienteId) return;
    setError(null);
    setEnviando(true);
    try {
      await prescribirTratamiento({
        pacienteId,
        medicamento,
        dosis,
        indicaciones: indicaciones || undefined,
      });
      navigate('/medico/tratamientos');
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo prescribir el tratamiento'));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div>
      <h1>Prescribir tratamiento</h1>
      <form className="inline-form" onSubmit={onSubmit}>
        {error && <p className="error">{error}</p>}
        <label>
          Medicamento
          <input value={medicamento} onChange={(e) => setMedicamento(e.target.value)} required />
        </label>
        <label>
          Dosis y frecuencia
          <input value={dosis} onChange={(e) => setDosis(e.target.value)} required />
        </label>
        <label>
          Indicaciones (opcional)
          <textarea
            value={indicaciones}
            onChange={(e) => setIndicaciones(e.target.value)}
            rows={3}
          />
        </label>
        <button type="submit" disabled={enviando}>
          {enviando ? 'Guardando…' : 'Prescribir'}
        </button>
      </form>
    </div>
  );
}
