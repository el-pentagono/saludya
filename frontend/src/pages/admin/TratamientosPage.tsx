import { useEffect, useState } from 'react';
import { listarTratamientos } from '../../api/treatments';
import type { Treatment } from '../../types';

export function TratamientosPage() {
  const [tratamientos, setTratamientos] = useState<Treatment[]>([]);

  useEffect(() => {
    listarTratamientos()
      .then(setTratamientos)
      .catch(() => setTratamientos([]));
  }, []);

  return (
    <div>
      <h1>Tratamientos del sistema</h1>
      <table className="tabla">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Paciente</th>
            <th>Médico</th>
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
              <td>{t.medico ? `${t.medico.nombre} ${t.medico.apellido}` : '—'}</td>
              <td>{t.medicamento}</td>
              <td>{t.dosis}</td>
              <td>
                <span className={`badge badge-${t.estado}`}>{t.estado}</span>
              </td>
            </tr>
          ))}
          {tratamientos.length === 0 && (
            <tr>
              <td colSpan={6}>No hay tratamientos cargados.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
