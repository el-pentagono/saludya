import { useEffect, useState } from 'react';
import { asignarTriaje, atenderTriaje, listarTriaje } from '../../api/triage';
import { extraerMensajeError } from '../../api/errors';
import { useAuth } from '../../context/AuthContext';
import type { TriajeCaso } from '../../types';

export function MedicoTriagePage() {
  const { usuario } = useAuth();
  const [casos, setCasos] = useState<TriajeCaso[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [procesandoId, setProcesandoId] = useState<string | null>(null);

  const cargar = () => {
    listarTriaje()
      .then(setCasos)
      .catch(() => setCasos([]));
  };

  useEffect(() => {
    cargar();
  }, []);

  const onAsignar = async (id: string) => {
    setError(null);
    setProcesandoId(id);
    try {
      await asignarTriaje(id);
      cargar();
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo tomar el caso'));
    } finally {
      setProcesandoId(null);
    }
  };

  const onAtender = async (id: string) => {
    setError(null);
    setProcesandoId(id);
    try {
      await atenderTriaje(id);
      cargar();
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo cerrar el caso'));
    } finally {
      setProcesandoId(null);
    }
  };

  return (
    <div>
      <h1>Triaje crítico</h1>
      {error && <p className="error">{error}</p>}

      <table className="tabla">
        <thead>
          <tr>
            <th>Paciente</th>
            <th>Prioridad</th>
            <th>Estado</th>
            <th>Observaciones</th>
            <th>Asignado a</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {casos.map((c) => {
            const esMio = c.medicoAsignadoId === usuario?.id;
            return (
              <tr key={c.id}>
                <td>{c.paciente ? `${c.paciente.nombre} ${c.paciente.apellido}` : '—'}</td>
                <td>
                  <span className={`badge badge-${c.prioridad}`}>{c.prioridad}</span>
                </td>
                <td>
                  <span className={`badge badge-${c.estado}`}>{c.estado}</span>
                </td>
                <td>{c.observaciones}</td>
                <td>
                  {c.medicoAsignado
                    ? `${c.medicoAsignado.nombre} ${c.medicoAsignado.apellido}`
                    : '—'}
                </td>
                <td>
                  {c.estado === 'en_espera' && (
                    <button disabled={procesandoId === c.id} onClick={() => onAsignar(c.id)}>
                      {procesandoId === c.id ? 'Tomando…' : 'Tomar caso'}
                    </button>
                  )}
                  {c.estado === 'asignado' && esMio && (
                    <button disabled={procesandoId === c.id} onClick={() => onAtender(c.id)}>
                      {procesandoId === c.id ? 'Cerrando…' : 'Atender'}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
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
