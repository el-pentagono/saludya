import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarTurnos } from '../api/appointments';
import { useAuth } from '../context/AuthContext';
import type { Appointment } from '../types';

export function DashboardPage() {
  const { usuario } = useAuth();
  const esMedico = usuario?.rol === 'medico';
  const [turnos, setTurnos] = useState<Appointment[]>([]);

  useEffect(() => {
    listarTurnos()
      .then(setTurnos)
      .catch(() => setTurnos([]));
  }, []);

  const proximos = turnos
    .filter((t) => t.estado === 'pendiente')
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    .slice(0, 3);

  return (
    <div>
      <h1>Hola, {usuario?.nombre}</h1>

      <div className="cards">
        {esMedico ? (
          <>
            <Link className="card" to="/medico/agenda">
              Mi agenda
            </Link>
            <Link className="card" to="/medico/tratamientos">
              Tratamientos prescritos
            </Link>
          </>
        ) : (
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
        )}
        <Link className="card" to="/perfil">
          Mi perfil
        </Link>
      </div>

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
    </div>
  );
}
