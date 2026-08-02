import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { crearRegistroBoveda } from '../../api/bovedaSaludMental';
import { extraerMensajeError } from '../../api/errors';

export function BovedaCreatePage() {
  const { pacienteId } = useParams<{ pacienteId: string }>();
  const navigate = useNavigate();
  const [notasPrivadas, setNotasPrivadas] = useState('');
  const [resumenPaciente, setResumenPaciente] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!pacienteId) return;
    setError(null);
    setEnviando(true);
    try {
      await crearRegistroBoveda({ pacienteId, notasPrivadas, resumenPaciente });
      navigate('/medico/boveda-salud-mental');
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo guardar la entrada'));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div>
      <h1>Bóveda de salud mental — nueva entrada</h1>
      <form className="inline-form" onSubmit={onSubmit}>
        {error && <p className="error">{error}</p>}
        <label>
          Notas privadas (solo vos, director y auditor las ven)
          <textarea
            value={notasPrivadas}
            onChange={(e) => setNotasPrivadas(e.target.value)}
            rows={4}
            required
          />
        </label>
        <label>
          Resumen para el paciente
          <textarea
            value={resumenPaciente}
            onChange={(e) => setResumenPaciente(e.target.value)}
            rows={3}
            required
          />
        </label>
        <button type="submit" disabled={enviando}>
          {enviando ? 'Guardando…' : 'Guardar entrada'}
        </button>
      </form>
    </div>
  );
}
