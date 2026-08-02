import { useEffect, useState } from 'react';
import { listarTriaje } from '../../api/triage';
import type { TriajeCaso } from '../../types';

export function TriagePage() {
  const [casos, setCasos] = useState<TriajeCaso[]>([]);

  useEffect(() => {
    listarTriaje()
      .then(setCasos)
      .catch(() => setCasos([]));
  }, []);

  return (
    <div>
      <h1>Triaje crítico del sistema</h1>
      <table className="tabla">
        <thead>
          <tr>
            <th>Paciente</th>
            <th>Evaluador</th>
            <th>Prioridad</th>
            <th>Estado</th>
            <th>Médico asignado</th>
            <th>Observaciones</th>
          </tr>
        </thead>
        <tbody>
          {casos.map((c) => (
            <tr key={c.id}>
              <td>{c.paciente ? `${c.paciente.nombre} ${c.paciente.apellido}` : '—'}</td>
              <td>{c.evaluador ? `${c.evaluador.nombre} ${c.evaluador.apellido}` : '—'}</td>
              <td>
                <span className={`badge badge-${c.prioridad}`}>{c.prioridad}</span>
              </td>
              <td>
                <span className={`badge badge-${c.estado}`}>{c.estado}</span>
              </td>
              <td>
                {c.medicoAsignado
                  ? `${c.medicoAsignado.nombre} ${c.medicoAsignado.apellido}`
                  : '—'}
              </td>
              <td>{c.observaciones}</td>
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
