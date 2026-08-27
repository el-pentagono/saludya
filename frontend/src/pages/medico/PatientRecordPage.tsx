import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { extraerMensajeError } from '../../api/errors';
import { crearEntradaHistoriaClinica, listarHistoriaClinica } from '../../api/medicalRecords';
import { ModalTurnoDinamico } from '../../components/ModalTurnoDinamico';
import type { MedicalRecordEntry } from '../../types';

export function PatientRecordPage() {
  const { pacienteId } = useParams<{ pacienteId: string }>();
  const [entradas, setEntradas] = useState<MedicalRecordEntry[]>([]);
  const [diagnostico, setDiagnostico] = useState('');
  const [notas, setNotas] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [modalTurnoAbierto, setModalTurnoAbierto] = useState(false);

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
      setMensajeExito('Entrada en historia clínica registrada con éxito.');
      cargar();
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo guardar la entrada'));
    } finally {
      setEnviando(false);
    }
  };

  // Nombre del paciente inferido de entradas previas o genérico
  const primerEntradaConPaciente = entradas.find((e) => e.paciente);
  const nombrePaciente = primerEntradaConPaciente?.paciente
    ? `${primerEntradaConPaciente.paciente.nombre} ${primerEntradaConPaciente.paciente.apellido}`
    : 'Paciente';

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/medico/agenda" style={{ color: 'var(--color-primary-dark)', textDecoration: 'none' }}>
          ← Volver a Mi Agenda
        </Link>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        <div>
          <h1 style={{ margin: '0 0 0.25rem' }}>Historia clínica del paciente</h1>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.92rem' }}>
            {nombrePaciente}
          </p>
        </div>

        {pacienteId && (
          <button
            type="button"
            style={{
              background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
              color: '#ffffff',
              fontWeight: 700,
              padding: '0.65rem 1.25rem',
              borderRadius: 8,
              boxShadow: '0 2px 4px rgba(22, 101, 52, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
            onClick={() => setModalTurnoAbierto(true)}
          >
            📅 TURNO (Agendamiento Cruzado)
          </button>
        )}
      </div>

      {mensajeExito && (
        <div
          style={{
            background: '#dcfce7',
            border: '1px solid #86efac',
            color: '#166534',
            padding: '0.75rem 1rem',
            borderRadius: 8,
            marginBottom: '1rem',
          }}
        >
          {mensajeExito}
        </div>
      )}

      {error && <p className="error">{error}</p>}

      <form className="inline-form" onSubmit={onSubmit}>
        <h2>Agregar entrada</h2>
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

      {modalTurnoAbierto && pacienteId && (
        <ModalTurnoDinamico
          pacienteId={pacienteId}
          nombrePaciente={nombrePaciente}
          onClose={() => setModalTurnoAbierto(false)}
          onTurnoAgendado={(nuevo) => {
            setModalTurnoAbierto(false);
            setMensajeExito(
              `Turno agendado exitosamente para el ${new Date(nuevo.fecha).toLocaleString('es-AR')}. Se notificó al paciente.`,
            );
          }}
        />
      )}
    </div>
  );
}
