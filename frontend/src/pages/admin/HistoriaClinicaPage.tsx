import { useEffect, useState } from 'react';
import { listarTodasHistoriasClinicas } from '../../api/medicalRecords';
import type { MedicalRecordEntry } from '../../types';

export function HistoriaClinicaPage() {
  const [entradas, setEntradas] = useState<MedicalRecordEntry[]>([]);

  useEffect(() => {
    listarTodasHistoriasClinicas()
      .then(setEntradas)
      .catch(() => setEntradas([]));
  }, []);

  return (
    <div>
      <h1>Historia clínica del sistema</h1>
      <ul className="lista-entradas">
        {entradas.map((e) => (
          <li key={e.id}>
            <strong>{new Date(e.fecha).toLocaleDateString('es-AR')}</strong> — {e.diagnostico}
            <span className="detalle">
              {' '}
              {e.paciente && `— ${e.paciente.nombre} ${e.paciente.apellido}`}
              {e.medico && ` (Dr/a. ${e.medico.nombre} ${e.medico.apellido})`}
            </span>
            {e.notas && <p className="notas">{e.notas}</p>}
          </li>
        ))}
        {entradas.length === 0 && <li>No hay entradas cargadas.</li>}
      </ul>
    </div>
  );
}
