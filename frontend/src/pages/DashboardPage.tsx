import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { obtenerResumenAdmin } from '../api/admin';
import { listarTurnos } from '../api/appointments';
import { listarTratamientos } from '../api/treatments';
import { listarTriaje } from '../api/triage';
import { useAuth } from '../context/AuthContext';
import type { AdminResumen, Appointment, Treatment, TriajeCaso } from '../types';

function CardsPorRol({ rol }: { rol: string | undefined }) {
  if (rol === 'medico') {
    return (
      <>
        <Link className="card" to="/medico/agenda">
          Mi agenda
        </Link>
        <Link className="card" to="/medico/triaje">
          Triaje crítico
        </Link>
        <Link className="card" to="/medico/tratamientos">
          Tratamientos prescritos
        </Link>
      </>
    );
  }
  if (rol === 'enfermero') {
    return (
      <>
        <Link className="card" to="/enfermero/triaje">
          Triaje crítico
        </Link>
        <Link className="card" to="/enfermero/tratamientos">
          Seguimiento de tratamientos
        </Link>
      </>
    );
  }
  if (rol === 'farmaceutico') {
    return (
      <Link className="card" to="/farmaceutico/dispensacion">
        Dispensación
      </Link>
    );
  }
  if (rol === 'director' || rol === 'auditor') {
    return (
      <>
        <Link className="card" to="/admin/resumen">
          Resumen
        </Link>
        <Link className="card" to="/admin/usuarios">
          Usuarios
        </Link>
      </>
    );
  }
  return (
    <>
      <Link className="card" to="/turnos">
        Mis turnos
      </Link>
      <Link className="card" to="/historia-clinica">
        Historia clínica
      </Link>
      <Link className="card" to="/documentos">
        Documentos
      </Link>
    </>
  );
}

export function DashboardPage() {
  const { usuario } = useAuth();
  const rol = usuario?.rol;
  const esAdmin = rol === 'director' || rol === 'auditor';
  const [turnos, setTurnos] = useState<Appointment[]>([]);
  const [casosTriaje, setCasosTriaje] = useState<TriajeCaso[]>([]);
  const [tratamientos, setTratamientos] = useState<Treatment[]>([]);
  const [resumen, setResumen] = useState<AdminResumen | null>(null);

  useEffect(() => {
    if (rol === 'enfermero') {
      listarTriaje()
        .then(setCasosTriaje)
        .catch(() => setCasosTriaje([]));
    } else if (rol === 'farmaceutico') {
      listarTratamientos()
        .then(setTratamientos)
        .catch(() => setTratamientos([]));
    } else if (esAdmin) {
      obtenerResumenAdmin()
        .then(setResumen)
        .catch(() => setResumen(null));
    } else {
      listarTurnos()
        .then(setTurnos)
        .catch(() => setTurnos([]));
    }
  }, [rol, esAdmin]);

  const proximos = turnos
    .filter((t) => t.estado === 'pendiente')
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    .slice(0, 3);

  const casosEnEspera = casosTriaje.filter((c) => c.estado === 'en_espera');
  const tratamientosPendientes = tratamientos.filter((t) => t.estado === 'prescrito');
  const totalUsuarios = resumen
    ? Object.values(resumen.usuariosPorRol).reduce((acc, n) => acc + n, 0)
    : 0;

  return (
    <div>
      <h1>Hola, {usuario?.nombre}</h1>

      <div className="cards">
        <CardsPorRol rol={rol} />
        <Link className="card" to="/perfil">
          Mi perfil
        </Link>
      </div>

      {rol === 'enfermero' && (
        <>
          <h2>Casos de triaje en espera</h2>
          {casosEnEspera.length === 0 ? (
            <p>No hay casos en espera.</p>
          ) : (
            <ul>
              {casosEnEspera.map((c) => (
                <li key={c.id}>
                  {c.paciente ? `${c.paciente.nombre} ${c.paciente.apellido}` : '—'} —{' '}
                  <span className={`badge badge-${c.prioridad}`}>{c.prioridad}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {rol === 'farmaceutico' && (
        <>
          <h2>Tratamientos pendientes de dispensar</h2>
          {tratamientosPendientes.length === 0 ? (
            <p>No hay tratamientos pendientes.</p>
          ) : (
            <ul>
              {tratamientosPendientes.map((t) => (
                <li key={t.id}>
                  {t.paciente ? `${t.paciente.nombre} ${t.paciente.apellido}` : '—'} —{' '}
                  {t.medicamento} ({t.dosis})
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {esAdmin && (
        <>
          <h2>Vista general</h2>
          {resumen ? (
            <p>
              <strong>{totalUsuarios}</strong> usuarios registrados en el sistema.{' '}
              {resumen.turnosPorEstado.pendiente ? (
                <>
                  <strong>{resumen.turnosPorEstado.pendiente}</strong> turnos pendientes.
                </>
              ) : (
                'Sin turnos pendientes.'
              )}
            </p>
          ) : (
            <p>Cargando…</p>
          )}
        </>
      )}

      {!esAdmin && rol !== 'enfermero' && rol !== 'farmaceutico' && (
        <>
          <h2>{rol === 'medico' ? 'Próximos turnos de tu agenda' : 'Próximos turnos'}</h2>
          {proximos.length === 0 ? (
            <p>No tenés turnos pendientes.</p>
          ) : (
            <ul>
              {proximos.map((t) => (
                <li key={t.id}>
                  {new Date(t.fecha).toLocaleString('es-AR')}
                  {rol === 'medico'
                    ? t.paciente && ` — ${t.paciente.nombre} ${t.paciente.apellido}`
                    : t.medico && ` — Dr/a. ${t.medico.nombre} ${t.medico.apellido}`}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
