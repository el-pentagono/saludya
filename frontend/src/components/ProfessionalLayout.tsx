import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NotificationBell } from './NotificationBell';
import { SaludYaPortalLogo } from './SaludYaPortalLogo';

export function formatRol(rol: string | undefined): string {
  switch (rol) {
    case 'medico':
      return 'Médico';
    case 'enfermero':
      return 'Enfermero';
    case 'farmaceutico':
      return 'Farmacéutico';
    case 'director':
      return 'Director Hospitalario';
    case 'auditor':
      return 'Auditor Clínico';
    case 'paciente':
      return 'Paciente';
    default:
      return rol ?? 'Profesional';
  }
}

function NavLinksProfesionales({ rol }: { rol: string | undefined }) {
  return (
    <>
      <NavLink to="/profesionales" end>
        Dashboard
      </NavLink>

      {rol === 'medico' && (
        <>
          <NavLink to="/medico/agenda">Mi agenda</NavLink>
          <NavLink to="/medico/estudios">Órdenes de estudio</NavLink>
          <NavLink to="/medico/tratamientos">Tratamientos</NavLink>
          <NavLink to="/medico/triaje">Triaje crítico</NavLink>
          <NavLink to="/medico/boveda-salud-mental">Bóveda salud mental</NavLink>
        </>
      )}

      {rol === 'enfermero' && (
        <>
          <NavLink to="/enfermero/triaje">Triaje crítico</NavLink>
          <NavLink to="/enfermero/tratamientos">Seguimiento</NavLink>
        </>
      )}

      {rol === 'farmaceutico' && (
        <NavLink to="/farmaceutico/dispensacion">Dispensación de recetas</NavLink>
      )}

      {(rol === 'director' || rol === 'auditor') && (
        <>
          <NavLink to="/admin/resumen">Resumen</NavLink>
          <NavLink to="/admin/usuarios">Usuarios</NavLink>
          <NavLink to="/admin/turnos">Turnos</NavLink>
          <NavLink to="/admin/tratamientos">Tratamientos</NavLink>
          <NavLink to="/admin/documentos">Documentos</NavLink>
          <NavLink to="/admin/triaje">Triaje</NavLink>
          <NavLink to="/admin/historia-clinica">Historia clínica</NavLink>
          <NavLink to="/admin/ambient-ai">Ambient AI</NavLink>
        </>
      )}

      <NavLink to="/perfil">Perfil</NavLink>
    </>
  );
}

export function ProfessionalLayout() {
  const { usuario, logout } = useAuth();

  return (
    <div className="layout professional-portal-layout">
      <header
        className="topbar"
        style={{
          background: 'linear-gradient(90deg, #064e3b 0%, #047857 100%)',
          borderBottom: '1px solid #065f46',
        }}
      >
        <Link to="/profesionales" style={{ textDecoration: 'none' }}>
          <SaludYaPortalLogo portal="profesionales" size={26} />
        </Link>

        <nav>
          <NavLinksProfesionales rol={usuario?.rol} />
        </nav>

        <div className="usuario-actual">
          {/* Indicador visible y formal del rol activo */}
          <span
            className="badge-rol-activo"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: '#ecfdf5',
              padding: '0.25rem 0.65rem',
              borderRadius: '999px',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#4ade80',
              }}
            />
            Conectado como: <strong>{formatRol(usuario?.rol)}</strong>
          </span>

          <NotificationBell />

          <span style={{ fontSize: '0.85rem' }}>
            {usuario?.nombre} {usuario?.apellido}
          </span>

          <button onClick={logout} title="Cerrar sesión profesional">
            Salir
          </button>
        </div>
      </header>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
