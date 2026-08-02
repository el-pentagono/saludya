import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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

      <h2>Ver todo el sistema</h2>
      <div className="cards">
        <Link className="card" to="/admin/turnos">
          Turnos
        </Link>
        <Link className="card" to="/admin/tratamientos">
          Tratamientos
        </Link>
        <Link className="card" to="/admin/documentos">
          Documentos
        </Link>
        <Link className="card" to="/admin/triaje">
          Triaje crítico
        </Link>
        <Link className="card" to="/admin/historia-clinica">
          Historia clínica
        </Link>
        <Link className="card" to="/admin/boveda-salud-mental">
          Bóveda salud mental
        </Link>
        <Link className="card" to="/admin/ambient-ai">
          Ambient AI
        </Link>
      </div>
    </div>
  );
}
