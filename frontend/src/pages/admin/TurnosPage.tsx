import { useEffect, useState } from 'react';
import { listarTurnos } from '../../api/appointments';
import type { Appointment } from '../../types';

export function TurnosPage() {
  const [turnos, setTurnos] = useState<Appointment[]>([]);

  useEffect(() => {
    listarTurnos()
      .then(setTurnos)
      .catch(() => setTurnos([]));
  }, []);

  return (
    <div>
      <h1>Turnos del sistema</h1>
      <table className="tabla">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Paciente</th>
            <th>Médico</th>
            <th>Motivo</th>
            <th>Estado</th>
            <th>Liquidación</th>
          </tr>
        </thead>
        <tbody>
          {turnos.map((t) => (
            <tr key={t.id}>
              <td>{new Date(t.fecha).toLocaleString('es-AR')}</td>
              <td>{t.paciente ? `${t.paciente.nombre} ${t.paciente.apellido}` : '—'}</td>
              <td>{t.medico ? `${t.medico.nombre} ${t.medico.apellido}` : '—'}</td>
              <td>{t.motivo ?? '—'}</td>
              <td>
                <span className={`badge badge-${t.estado}`}>{t.estado}</span>
              </td>
              <td>{t.estadoLiquidacion === 'pendiente' ? 'Pendiente' : '—'}</td>
            </tr>
          ))}
          {turnos.length === 0 && (
            <tr>
              <td colSpan={6}>No hay turnos cargados.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
