import { useEffect, useState } from 'react';
import { obtenerResumenAdmin } from '../../api/admin';
import type { AdminResumen } from '../../types';

export function ResumenPage() {
  const [resumen, setResumen] = useState<AdminResumen | null>(null);

  useEffect(() => {
    obtenerResumenAdmin()
      .then(setResumen)
      .catch(() => setResumen(null));
  }, []);

  if (!resumen) return <p>Cargando…</p>;

  return (
    <div>
      <h1>Resumen del sistema</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h2>Usuarios por rol</h2>
          <ul>
            {Object.entries(resumen.usuariosPorRol).map(([rol, cantidad]) => (
              <li key={rol}>
                {rol}: <strong>{cantidad}</strong>
              </li>
            ))}
          </ul>
        </div>

        <div className="stat-card">
          <h2>Turnos por estado</h2>
          <ul>
            {Object.entries(resumen.turnosPorEstado).map(([estado, cantidad]) => (
              <li key={estado}>
                {estado}: <strong>{cantidad}</strong>
              </li>
            ))}
            {Object.keys(resumen.turnosPorEstado).length === 0 && <li>Sin turnos todavía.</li>}
          </ul>
        </div>

        <div className="stat-card">
          <h2>Tratamientos por estado</h2>
          <ul>
            {Object.entries(resumen.tratamientosPorEstado).map(([estado, cantidad]) => (
              <li key={estado}>
                {estado}: <strong>{cantidad}</strong>
              </li>
            ))}
            {Object.keys(resumen.tratamientosPorEstado).length === 0 && (
              <li>Sin tratamientos todavía.</li>
            )}
          </ul>
        </div>

        <div className="stat-card">
          <h2>Historias clínicas</h2>
          <p className="stat-numero">{resumen.totalHistoriasClinicas}</p>
        </div>
      </div>
    </div>
  );
}
