import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarTratamientos } from '../../api/treatments';
import type { Treatment } from '../../types';

export function TreatmentFollowUpsPage() {
  const [tratamientos, setTratamientos] = useState<Treatment[]>([]);

  useEffect(() => {
    listarTratamientos()
      .then(setTratamientos)
      .catch(() => setTratamientos([]));
  }, []);

  return (
    <div>
      <h1>Tratamientos — seguimiento</h1>
      <table className="tabla">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Paciente</th>
            <th>Medicamento</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {tratamientos.map((t) => (
            <tr key={t.id}>
              <td>{new Date(t.fechaCreacion).toLocaleDateString('es-AR')}</td>
              <td>{t.paciente ? `${t.paciente.nombre} ${t.paciente.apellido}` : '—'}</td>
              <td>
                {t.medicamento} — {t.dosis}
              </td>
              <td>
                <span className={`badge badge-${t.estado}`}>{t.estado}</span>
              </td>
              <td>
                <Link to={`/enfermero/tratamientos/${t.id}`}>Ver seguimiento</Link>
              </td>
            </tr>
          ))}
          {tratamientos.length === 0 && (
            <tr>
              <td colSpan={5}>No hay tratamientos cargados todavía.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
