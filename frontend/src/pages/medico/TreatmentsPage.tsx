import { useEffect, useState } from 'react';
import { listarTratamientos } from '../../api/treatments';
import type { Treatment } from '../../types';

export function TreatmentsPage() {
  const [tratamientos, setTratamientos] = useState<Treatment[]>([]);

  useEffect(() => {
    listarTratamientos()
      .then(setTratamientos)
      .catch(() => setTratamientos([]));
  }, []);

  return (
    <div>
      <h1>Tratamientos prescritos</h1>
      <table className="tabla">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Paciente</th>
            <th>Medicamento</th>
            <th>Dosis</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {tratamientos.map((t) => (
            <tr key={t.id}>
              <td>{new Date(t.fechaCreacion).toLocaleDateString('es-AR')}</td>
              <td>{t.paciente ? `${t.paciente.nombre} ${t.paciente.apellido}` : '—'}</td>
              <td>{t.medicamento}</td>
              <td>{t.dosis}</td>
              <td>
                <span className={`badge badge-${t.estado}`}>{t.estado}</span>
              </td>
            </tr>
          ))}
          {tratamientos.length === 0 && (
            <tr>
              <td colSpan={5}>Todavía no prescribiste tratamientos.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
