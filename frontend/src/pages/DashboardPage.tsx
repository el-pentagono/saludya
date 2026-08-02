import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarTurnos } from '../api/appointments';
import { listarTriaje } from '../api/triage';
import { useAuth } from '../context/AuthContext';
import type { Appointment, TriajeCaso } from '../types';

function CardsPorRol({ rol }: { rol: string | undefined }) {
  if (rol === 'medico') {
    return (
      <>
        <Link className="card" to="/medico/agenda">
          Mi agenda
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
  const esMedico = usuario?.rol === 'medico';
  const esEnfermero = usuario?.rol === 'enfermero';
  const [turnos, setTurnos] = useState<Appointment[]>([]);
  const [casosTriaje, setCasosTriaje] = useState<TriajeCaso[]>([]);

  useEffect(() => {
    if (esEnfermero) {
      listarTriaje()
        .then(setCasosTriaje)
        .catch(() => setCasosTriaje([]));
    } else {
      listarTurnos()
        .then(setTurnos)
        .catch(() => setTurnos([]));
    }
  }, [esEnfermero]);

  const proximos = turnos
    .filter((t) => t.estado === 'pendiente')
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    .slice(0, 3);

  const casosEnEspera = casosTriaje.filter((c) => c.estado === 'en_espera');

  return (
    <div>
      <h1>Hola, {usuario?.nombre}</h1>

      <div className="cards">
        <CardsPorRol rol={usuario?.rol} />
        <Link className="card" to="/perfil">
          Mi perfil
        </Link>
      </div>

      {esEnfermero ? (
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
      ) : (
        <>
          <h2>{esMedico ? 'Próximos turnos de tu agenda' : 'Próximos turnos'}</h2>
          {proximos.length === 0 ? (
            <p>No tenés turnos pendientes.</p>
          ) : (
            <ul>
              {proximos.map((t) => (
                <li key={t.id}>
                  {new Date(t.fecha).toLocaleString('es-AR')}
                  {esMedico
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
