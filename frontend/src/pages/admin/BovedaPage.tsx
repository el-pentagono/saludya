import { useEffect, useState } from 'react';
import { listarBoveda } from '../../api/bovedaSaludMental';
import type { RegistroSaludMental } from '../../types';

export function BovedaPage() {
  const [entradas, setEntradas] = useState<RegistroSaludMental[]>([]);

  useEffect(() => {
    listarBoveda()
      .then(setEntradas)
      .catch(() => setEntradas([]));
  }, []);

  return (
    <div>
      <h1>Bóveda de salud mental del sistema</h1>
      <ul className="lista-entradas">
        {entradas.map((e) => (
          <li key={e.id}>
            <strong>{new Date(e.fecha).toLocaleDateString('es-AR')}</strong>
            {e.paciente && (
              <span className="detalle">
                {' '}
                — {e.paciente.nombre} {e.paciente.apellido}
              </span>
            )}
            {e.medico && (
              <span className="detalle"> (Dr/a. {e.medico.nombre} {e.medico.apellido})</span>
            )}
            <p className="notas">
              <em>Resumen paciente:</em> {e.resumenPaciente}
            </p>
            {e.notasPrivadas && (
              <p className="notas">
                <em>Notas privadas:</em> {e.notasPrivadas}
              </p>
            )}
          </li>
        ))}
        {entradas.length === 0 && <li>No hay entradas cargadas.</li>}
      </ul>
    </div>
  );
}
