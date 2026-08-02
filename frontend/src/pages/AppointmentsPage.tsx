import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { cancelarTurno, listarTurnos, reservarTurno } from '../api/appointments';
import { extraerMensajeError } from '../api/errors';
import { listarMedicos } from '../api/usuarios';
import type { Appointment, Medico } from '../types';

export function AppointmentsPage() {
  const [turnos, setTurnos] = useState<Appointment[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [medicoId, setMedicoId] = useState('');
  const [fecha, setFecha] = useState('');
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const cargarTurnos = () => {
    listarTurnos()
      .then(setTurnos)
      .catch(() => setTurnos([]));
  };

  useEffect(() => {
    cargarTurnos();
    listarMedicos()
      .then(setMedicos)
      .catch(() => setMedicos([]));
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await reservarTurno({
        medicoId,
        fecha: new Date(fecha).toISOString(),
        motivo: motivo || undefined,
      });
      setMedicoId('');
      setFecha('');
      setMotivo('');
      cargarTurnos();
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo reservar el turno'));
    } finally {
      setEnviando(false);
    }
  };

  const onCancelar = async (id: string) => {
    setError(null);
    try {
      await cancelarTurno(id);
      cargarTurnos();
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo cancelar el turno'));
    }
  };

  return (
    <div>
      <h1>Mis turnos</h1>

      <form className="inline-form" onSubmit={onSubmit}>
        <h2>Reservar turno</h2>
        {error && <p className="error">{error}</p>}
        <label>
          Médico
          <select value={medicoId} onChange={(e) => setMedicoId(e.target.value)} required>
            <option value="">Elegí un médico</option>
            {medicos.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre} {m.apellido}
              </option>
            ))}
          </select>
        </label>
        <label>
          Fecha y hora
          <input
            type="datetime-local"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
          />
        </label>
        <label>
          Motivo (opcional)
          <input value={motivo} onChange={(e) => setMotivo(e.target.value)} />
        </label>
        <button type="submit" disabled={enviando}>
          {enviando ? 'Reservando…' : 'Reservar'}
        </button>
      </form>

      <table className="tabla">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Médico</th>
            <th>Motivo</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {turnos.map((t) => (
            <tr key={t.id}>
              <td>{new Date(t.fecha).toLocaleString('es-AR')}</td>
              <td>{t.medico ? `${t.medico.nombre} ${t.medico.apellido}` : '—'}</td>
              <td>{t.motivo ?? '—'}</td>
              <td>
                <span className={`badge badge-${t.estado}`}>{t.estado}</span>
              </td>
              <td>
                {t.estado === 'pendiente' && (
                  <button onClick={() => onCancelar(t.id)}>Cancelar</button>
                )}
              </td>
            </tr>
          ))}
          {turnos.length === 0 && (
            <tr>
              <td colSpan={5}>Todavía no tenés turnos.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
