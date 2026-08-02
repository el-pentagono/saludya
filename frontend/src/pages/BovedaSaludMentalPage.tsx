import { useEffect, useState } from 'react';
import { listarBoveda } from '../api/bovedaSaludMental';
import type { RegistroSaludMental } from '../types';

export function BovedaSaludMentalPage() {
  const [entradas, setEntradas] = useState<RegistroSaludMental[]>([]);

  useEffect(() => {
    listarBoveda()
      .then(setEntradas)
      .catch(() => setEntradas([]));
  }, []);

  return (
    <div>
      <h1>Bóveda de salud mental</h1>
      <ul className="lista-entradas">
        {entradas.map((e) => (
          <li key={e.id}>
            <strong>{new Date(e.fecha).toLocaleDateString('es-AR')}</strong>
            <p className="notas">{e.resumenPaciente}</p>
          </li>
        ))}
        {entradas.length === 0 && <li>Todavía no tenés entradas.</li>}
      </ul>
    </div>
  );
}
