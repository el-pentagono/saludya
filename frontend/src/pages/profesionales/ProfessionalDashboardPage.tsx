import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { obtenerResumenAdmin } from '../../api/admin';
import { listarTurnos } from '../../api/appointments';
import { listarOrdenesEstudio } from '../../api/studyOrders';
import { listarTratamientos } from '../../api/treatments';
import { listarTriaje } from '../../api/triage';
import { formatRol } from '../../components/ProfessionalLayout';
import { useAuth } from '../../context/AuthContext';
import type { AdminResumen, Appointment, StudyOrder, Treatment, TriajeCaso } from '../../types';

export function ProfessionalDashboardPage() {
  const { usuario } = useAuth();
  const rol = usuario?.rol;

  const [turnos, setTurnos] = useState<Appointment[]>([]);
  const [estudios, setEstudios] = useState<StudyOrder[]>([]);
  const [tratamientos, setTratamientos] = useState<Treatment[]>([]);
  const [casosTriaje, setCasosTriaje] = useState<TriajeCaso[]>([]);
  const [resumen, setResumen] = useState<AdminResumen | null>(null);

  useEffect(() => {
    if (rol === 'medico') {
      listarTurnos().then(setTurnos).catch(() => setTurnos([]));
      listarOrdenesEstudio().then(setEstudios).catch(() => setEstudios([]));
    } else if (rol === 'farmaceutico') {
      listarTratamientos().then(setTratamientos).catch(() => setTratamientos([]));
    } else if (rol === 'enfermero') {
      listarTriaje().then(setCasosTriaje).catch(() => setCasosTriaje([]));
      listarTratamientos().then(setTratamientos).catch(() => setTratamientos([]));
    } else if (rol === 'director' || rol === 'auditor') {
      obtenerResumenAdmin().then(setResumen).catch(() => setResumen(null));
    }
  }, [rol]);

  const turnosHoy = turnos.filter((t) => t.estado === 'pendiente');
  const recetasPendientes = tratamientos.filter((t) => t.estado === 'prescrito');
  const estudiosPendientes = estudios.filter((e) => e.estado === 'pendiente');
  const casosEnEspera = casosTriaje.filter((c) => c.estado === 'en_espera');

  return (
    <div>
      {/* Banner institucional del Portal Profesional */}
      <div
        style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
          color: '#ffffff',
          borderRadius: 12,
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 12px rgba(6, 78, 59, 0.15)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <img
              src="/logo-profesionales.jpg"
              alt="SaludYa — Profesionales de Salud"
              style={{
                width: '90px',
                height: '60px',
                objectFit: 'cover',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
              }}
            />
            <div>
              <span
                style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#a7f3d0',
                  fontWeight: 700,
                }}
              >
                SaludYa — Profesionales de Salud
              </span>
              <h1 style={{ margin: '0.2rem 0 0.4rem', color: '#ffffff', fontSize: '1.75rem' }}>
                Hola, {usuario?.nombre} {usuario?.apellido}
              </h1>
              <p style={{ margin: 0, color: '#ecfdf5', fontSize: '0.95rem' }}>
                Panel clínico y operativo del Sistema de Salud Integrado
              </p>
            </div>
          </div>

          {/* Indicador visible y formal de rol activo */}
          <div
            style={{
              background: '#047857',
              border: '1px solid #10b981',
              borderRadius: 8,
              padding: '0.5rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
            }}
          >
            <span style={{ fontSize: '0.72rem', color: '#a7f3d0', textTransform: 'uppercase', fontWeight: 600 }}>
              Rol Activo
            </span>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#34d399' }} />
              {formatRol(rol)}
            </span>
          </div>
        </div>
      </div>

      {/* Cards y accesos según rol */}
      <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Herramientas de Trabajo</h2>

      {rol === 'medico' && (
        <>
          <div className="cards">
            <Link className="card" to="/medico/agenda">
              Mi agenda ({turnosHoy.length} turnos)
            </Link>
            <Link className="card" to="/medico/estudios">
              Órdenes de estudio ({estudiosPendientes.length} pendientes)
            </Link>
            <Link className="card" to="/medico/tratamientos">
              Tratamientos prescritos
            </Link>
            <Link className="card" to="/medico/triaje">
              Triaje crítico
            </Link>
            <Link className="card" to="/medico/boveda-salud-mental">
              Bóveda salud mental
            </Link>
          </div>

          <h2>Turnos pendientes de tu agenda</h2>
          {turnosHoy.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)' }}>No tenés turnos pendientes en tu agenda.</p>
          ) : (
            <ul>
              {turnosHoy.slice(0, 5).map((t) => (
                <li key={t.id} style={{ marginBottom: '0.5rem' }}>
                  <Link to="/medico/agenda">
                    <strong>{new Date(t.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs</strong>
                    {t.paciente && ` — ${t.paciente.nombre} ${t.paciente.apellido}`}
                    {t.motivo && ` (${t.motivo})`}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {rol === 'farmaceutico' && (
        <>
          <div className="cards">
            <Link className="card" to="/farmaceutico/dispensacion" style={{ borderLeft: '4px solid #059669' }}>
              Dispensación de recetas ({recetasPendientes.length} pendientes)
            </Link>
          </div>

          <h2>Recetas pendientes de dispensar</h2>
          {recetasPendientes.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)' }}>No hay recetas pendientes en farmacia.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                Hay <strong>{recetasPendientes.length}</strong> recetas listas para entregar a los pacientes.
              </p>
              <Link
                to="/farmaceutico/dispensacion"
                style={{
                  display: 'inline-block',
                  background: '#059669',
                  color: '#fff',
                  padding: '0.6rem 1.2rem',
                  borderRadius: 6,
                  textDecoration: 'none',
                  fontWeight: 600,
                  width: 'fit-content',
                }}
              >
                Abrir pantalla de dispensación y escaneo →
              </Link>
            </div>
          )}
        </>
      )}

      {rol === 'enfermero' && (
        <>
          <div className="cards">
            <Link className="card" to="/enfermero/triaje">
              Triaje crítico ({casosEnEspera.length} en espera)
            </Link>
            <Link className="card" to="/enfermero/tratamientos">
              Seguimiento de tratamientos
            </Link>
          </div>

          <h2>Casos de triaje en espera</h2>
          {casosEnEspera.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)' }}>No hay pacientes esperando triaje.</p>
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

      {(rol === 'director' || rol === 'auditor') && (
        <>
          <div className="cards">
            <Link className="card" to="/admin/resumen">
              Resumen institucional
            </Link>
            <Link className="card" to="/admin/usuarios">
              Gestión de usuarios
            </Link>
            <Link className="card" to="/admin/turnos">
              Control de turnos
            </Link>
            <Link className="card" to="/admin/tratamientos">
              Auditoría de tratamientos
            </Link>
          </div>

          {resumen && (
            <p>
              Hay <strong>{Object.values(resumen.usuariosPorRol).reduce((a, b) => a + b, 0)}</strong> usuarios
              registrados en la plataforma.
            </p>
          )}
        </>
      )}
    </div>
  );
}
