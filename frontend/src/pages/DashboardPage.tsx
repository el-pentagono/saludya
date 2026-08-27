import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { listarTurnos } from '../api/appointments';
import { listarOrdenesEstudio } from '../api/studyOrders';
import { listarTratamientos } from '../api/treatments';
import { useAuth } from '../context/AuthContext';
import type { Appointment, StudyOrder, Treatment } from '../types';

export function DashboardPage() {
  const { usuario } = useAuth();
  const rol = usuario?.rol;

  // Si no es paciente, redirige automáticamente al Portal de Profesionales de Salud
  if (rol && rol !== 'paciente') {
    return <Navigate to="/profesionales" replace />;
  }

  const [turnos, setTurnos] = useState<Appointment[]>([]);
  const [recetas, setRecetas] = useState<Treatment[]>([]);
  const [estudios, setEstudios] = useState<StudyOrder[]>([]);

  useEffect(() => {
    listarTurnos().then(setTurnos).catch(() => setTurnos([]));
    listarTratamientos().then(setRecetas).catch(() => setRecetas([]));
    listarOrdenesEstudio().then(setEstudios).catch(() => setEstudios([]));
  }, []);

  const proximosTurnos = turnos
    .filter((t) => t.estado === 'pendiente')
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    .slice(0, 3);

  const recetasPendientes = recetas.filter((r) => r.estado === 'prescrito');
  const estudiosPendientes = estudios.filter((e) => e.estado === 'pendiente');

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <img
          src="/logo-pacientes.jpg"
          alt="SaludYa — Pacientes"
          style={{
            width: '84px',
            height: '56px',
            objectFit: 'cover',
            borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            border: '1px solid var(--color-border)',
          }}
        />
        <div>
          <span
            style={{
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--color-primary)',
              fontWeight: 700,
            }}
          >
            Portal de Pacientes
          </span>
          <h1 style={{ margin: '0.15rem 0 0' }}>Hola, {usuario?.nombre}</h1>
        </div>
      </div>

      {/* Accesos Rápidos del Paciente */}
      <div className="cards">
        <Link className="card" to="/turnos">
          Mis turnos
        </Link>
        <Link className="card" to="/recetas">
          Mis recetas y estudios
          {recetasPendientes.length > 0 && (
            <span
              style={{
                display: 'block',
                fontSize: '0.75rem',
                color: '#0369a1',
                marginTop: '0.25rem',
              }}
            >
              ● {recetasPendientes.length} para retirar
            </span>
          )}
        </Link>
        <Link className="card" to="/historia-clinica">
          Historia clínica
        </Link>
        <Link className="card" to="/documentos">
          Documentos y certificados
        </Link>
        <Link className="card" to="/boveda-salud-mental">
          Bóveda salud mental
        </Link>
        <Link className="card" to="/perfil">
          Mi perfil
        </Link>
      </div>

      {/* Alerta de Recetas pendientes de retirar en Farmacia */}
      {recetasPendientes.length > 0 && (
        <div
          style={{
            background: '#f0fdfa',
            border: '1px solid #99f6e4',
            borderRadius: 10,
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <strong style={{ color: '#0f766e', fontSize: '1rem' }}>
                Tenés {recetasPendientes.length} receta{recetasPendientes.length > 1 ? 's' : ''} pendiente{recetasPendientes.length > 1 ? 's' : ''} de retirar en farmacia
              </strong>
              <div style={{ fontSize: '0.85rem', color: '#115e59', marginTop: '0.2rem' }}>
                {recetasPendientes.map((r) => `${r.medicamento} (${r.cantidad || '1 unidad'})`).join(' • ')}
              </div>
            </div>
            <Link
              to="/recetas"
              style={{
                background: 'var(--color-primary)',
                color: '#ffffff',
                padding: '0.4rem 0.85rem',
                borderRadius: 6,
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              Ver instrucciones de retiro →
            </Link>
          </div>
        </div>
      )}

      {/* Alerta de Estudios Médicos */}
      {estudiosPendientes.length > 0 && (
        <div
          style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: 10,
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <strong style={{ color: '#1e40af', fontSize: '1rem' }}>
                Estudios médicos programados: {estudiosPendientes.length}
              </strong>
              <div style={{ fontSize: '0.85rem', color: '#1e3a8a', marginTop: '0.2rem' }}>
                {estudiosPendientes.map((e) => `${e.tipoEstudio} en ${e.lugar}`).join(' • ')}
              </div>
            </div>
            <Link
              to="/recetas"
              style={{
                background: '#2563eb',
                color: '#ffffff',
                padding: '0.4rem 0.85rem',
                borderRadius: 6,
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              Ver órdenes →
            </Link>
          </div>
        </div>
      )}

      {/* Próximos turnos */}
      <h2>Próximos turnos</h2>
      {proximosTurnos.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>No tenés turnos programados.</p>
      ) : (
        <ul>
          {proximosTurnos.map((t) => (
            <li key={t.id} style={{ marginBottom: '0.5rem' }}>
              <Link to="/turnos">
                <strong>{new Date(t.fecha).toLocaleString('es-AR')}</strong>
                {t.medico && ` — Dr/a. ${t.medico.nombre} ${t.medico.apellido}`}
                {t.motivo && ` (${t.motivo})`}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
