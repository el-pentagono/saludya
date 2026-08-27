import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { extraerMensajeError } from '../../api/errors';
import { prescribirTratamiento } from '../../api/treatments';

export function PrescribePage() {
  const { pacienteId } = useParams<{ pacienteId: string }>();
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointmentId') ?? undefined;

  const navigate = useNavigate();
  const [medicamento, setMedicamento] = useState('');
  const [dosis, setDosis] = useState('');
  const [cantidad, setCantidad] = useState('30 comprimidos (1 caja)');
  const [esGratuita, setEsGratuita] = useState(true);
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
        cantidad,
        esGratuita,
        appointmentId,
        indicaciones: indicaciones || undefined,
      });
      navigate('/medico/tratamientos');
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo emitir la receta digital'));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div>
      <h1>Emitir Receta Digital</h1>
      <form className="inline-form" onSubmit={onSubmit}>
        {error && <p className="error">{error}</p>}
        <label>
          Medicamento
          <input
            value={medicamento}
            onChange={(e) => setMedicamento(e.target.value)}
            placeholder="Ej: Amoxicilina 500mg, Paracetamol 1g, Losartán 50mg..."
            required
          />
        </label>
        <label>
          Dosis y frecuencia
          <input
            value={dosis}
            onChange={(e) => setDosis(e.target.value)}
            placeholder="Ej: 1 comprimido cada 8 horas por 7 días"
            required
          />
        </label>
        <label>
          Cantidad
          <input
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            placeholder="Ej: 30 comprimidos, 1 frasco de 100ml, 2 cajas..."
            required
          />
        </label>
        <label style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={esGratuita}
            onChange={(e) => setEsGratuita(e.target.checked)}
            style={{ width: 'auto' }}
          />
          <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>
            Receta Gratuita / Cobertura Hospitalaria Oficial
          </span>
        </label>
        <label>
          Indicaciones adicionales (opcional)
          <textarea
            value={indicaciones}
            onChange={(e) => setIndicaciones(e.target.value)}
            placeholder="Ej: Tomar con las comidas. No suspender sin indicación médica."
            rows={3}
          />
        </label>

        <p style={{ fontSize: '0.85rem', color: '#0f766e', background: '#f0fdfa', padding: '0.6rem 0.85rem', borderRadius: 6 }}>
          ℹ Al emitir esta receta, el paciente recibirá una notificación y le figurará como <strong>"pendiente de retirar"</strong> en farmacia.
        </p>

        <button type="submit" disabled={enviando}>
          {enviando ? 'Emitiendo receta…' : 'Emitir Receta Digital'}
        </button>
      </form>
    </div>
  );
}
