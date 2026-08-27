import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { cancelarTriaje, crearTriaje, listarTriaje } from '../../api/triage';
import { buscarPacientePorDni } from '../../api/usuarios';
import { extraerMensajeError } from '../../api/errors';
import type { PersonaResumen, PrioridadTriaje, TriajeCaso } from '../../types';

const PRIORIDADES: PrioridadTriaje[] = ['baja', 'media', 'alta', 'critica'];

export function TriagePage() {
  const [casos, setCasos] = useState<TriajeCaso[]>([]);
  const [dni, setDni] = useState('');
  const [pacienteEncontrado, setPacienteEncontrado] = useState<PersonaResumen | null>(null);
  const [observaciones, setObservaciones] = useState('');
  const [prioridad, setPrioridad] = useState<PrioridadTriaje>('media');
  const [error, setError] = useState<string | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const cargar = () => {
    listarTriaje()
      .then(setCasos)
      .catch(() => setCasos([]));
  };

  useEffect(() => {
    cargar();
  }, []);

  const onBuscar = async () => {
    setError(null);
    setPacienteEncontrado(null);
    setBuscando(true);
    try {
      const paciente = await buscarPacientePorDni(dni);
      setPacienteEncontrado(paciente);
    } catch (err) {
      setError(extraerMensajeError(err, 'No se encontró un paciente con ese DNI'));
    } finally {
      setBuscando(false);
    }
  };

  const onCrear = async () => {
    if (!pacienteEncontrado) return;
    setError(null);
    setEnviando(true);
    try {
      await crearTriaje({ pacienteId: pacienteEncontrado.id, observaciones, prioridad });
      setPacienteEncontrado(null);
      setDni('');
      setObservaciones('');
      setPrioridad('media');
      cargar();
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo cargar el caso de triaje'));
    } finally {
      setEnviando(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (pacienteEncontrado) {
      onCrear();
    } else {
      onBuscar();
    }
  };

  const onCancelar = async (id: string) => {
    setError(null);
    try {
      await cancelarTriaje(id);
      cargar();
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo cancelar el caso'));
    }
  };

  return (
    <div>
      <h1>Triaje crítico</h1>
      {error && <p className="error">{error}</p>}

      <form className="inline-form" onSubmit={onSubmit}>
        <h2>Cargar caso</h2>
        <label>
          DNI del paciente
          <input
            value={dni}
            onChange={(e) => {
              setDni(e.target.value);
              setPacienteEncontrado(null);
            }}
            required
          />
        </label>

        {!pacienteEncontrado ? (
          <button type="submit" disabled={buscando}>
            {buscando ? 'Buscando…' : 'Buscar paciente'}
          </button>
        ) : (
          <>
            <p>
              Paciente: <strong>{pacienteEncontrado.nombre} {pacienteEncontrado.apellido}</strong>
            </p>
            <label>
              Prioridad
              <select
                value={prioridad}
                onChange={(e) => setPrioridad(e.target.value as PrioridadTriaje)}
              >
                {PRIORIDADES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Observaciones
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                rows={3}
                required
              />
            </label>
            <button type="submit" disabled={enviando}>
              {enviando ? 'Guardando…' : 'Cargar caso'}
            </button>
          </>
        )}
      </form>

      <table className="tabla">
        <thead>
          <tr>
            <th>Paciente</th>
            <th>Prioridad</th>
            <th>Estado</th>
            <th>Médico asignado</th>
            <th>Observaciones</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {casos.map((c) => (
            <tr key={c.id}>
              <td>{c.paciente ? `${c.paciente.nombre} ${c.paciente.apellido}` : '—'}</td>
              <td>
                <span className={`badge badge-${c.prioridad}`}>{c.prioridad}</span>
              </td>
              <td>
                <span className={`badge badge-${c.estado}`}>{c.estado}</span>
              </td>
              <td>
                {c.medicoAsignado
                  ? `Dr/a. ${c.medicoAsignado.nombre} ${c.medicoAsignado.apellido}`
                  : <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Sin asignar</span>}
              </td>
              <td>{c.observaciones}</td>
              <td>
                {c.estado === 'en_espera' && (
                  <button onClick={() => onCancelar(c.id)}>Cancelar</button>
                )}
              </td>
            </tr>
          ))}
          {casos.length === 0 && (
            <tr>
              <td colSpan={6}>No hay casos de triaje cargados.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
