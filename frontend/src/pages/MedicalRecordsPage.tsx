import { useEffect, useState } from 'react';
import { listarHistoriaClinica } from '../api/medicalRecords';
import { useAuth } from '../context/AuthContext';
import type { MedicalRecordEntry } from '../types';

export function MedicalRecordsPage() {
  const { usuario } = useAuth();
  const [entradas, setEntradas] = useState<MedicalRecordEntry[]>([]);

  useEffect(() => {
    if (!usuario) return;
    listarHistoriaClinica(usuario.id)
      .then(setEntradas)
      .catch(() => setEntradas([]));
  }, [usuario]);

  return (
    <div>
      <h1>Mi historia clínica</h1>
      {entradas.length === 0 ? (
        <p>Todavía no tenés entradas en tu historia clínica.</p>
      ) : (
        <ul className="lista-entradas">
          {entradas.map((e) => (
            <li key={e.id}>
              <strong>{new Date(e.fecha).toLocaleDateString('es-AR')}</strong> — {e.diagnostico}
              {e.medico && (
                <span className="detalle">
                  {' '}
                  (Dr/a. {e.medico.nombre} {e.medico.apellido})
                </span>
              )}
              {e.notas && <p className="notas">{e.notas}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
