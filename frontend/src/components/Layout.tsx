import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NotificationBell } from './NotificationBell';
import { SaludYaPortalLogo } from './SaludYaPortalLogo';

export function Layout() {
  const { usuario, logout } = useAuth();
  const esProfesional = usuario?.rol && usuario.rol !== 'paciente';

  return (
    <div className="layout patient-portal-layout">
      <header className="topbar">
        <Link to="/" style={{ textDecoration: 'none' }}>
          <SaludYaPortalLogo portal="pacientes" size={26} />
        </Link>

        <nav>
          <NavLink to="/" end>
            Inicio
          </NavLink>
          <NavLink to="/turnos">Mis turnos</NavLink>
          <NavLink to="/mi-disponibilidad">Mi disponibilidad</NavLink>
          <NavLink to="/recetas">Recetas y estudios</NavLink>
          <NavLink to="/historia-clinica">Historia clínica</NavLink>
          <NavLink to="/documentos">Documentos</NavLink>
          <NavLink to="/boveda-salud-mental">Bóveda salud mental</NavLink>
          <NavLink to="/perfil">Perfil</NavLink>
        </nav>

        <div className="usuario-actual">
          {esProfesional && (
            <Link
              to="/profesionales"
              style={{
                background: 'rgba(6, 78, 59, 0.4)',
                border: '1px solid rgba(167, 243, 208, 0.4)',
                color: '#ecfdf5',
                padding: '0.25rem 0.6rem',
                borderRadius: '6px',
                fontSize: '0.78rem',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              Ir a Portal Profesional →
            </Link>
          )}

          <NotificationBell />
          <span style={{ fontSize: '0.85rem' }}>
            {usuario?.nombre} {usuario?.apellido}
          </span>
          <button onClick={logout} title="Cerrar sesión de paciente">
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
