import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { StarOfLifeIcon } from './StarOfLifeIcon';

function NavLinksPorRol({ rol }: { rol: string | undefined }) {
  if (rol === 'medico') {
    return (
      <>
        <NavLink to="/medico/agenda">Mi agenda</NavLink>
        <NavLink to="/medico/triaje">Triaje crítico</NavLink>
        <NavLink to="/medico/tratamientos">Tratamientos</NavLink>
        <NavLink to="/medico/boveda-salud-mental">Bóveda salud mental</NavLink>
      </>
    );
  }
  if (rol === 'enfermero') {
    return (
      <>
        <NavLink to="/enfermero/triaje">Triaje crítico</NavLink>
        <NavLink to="/enfermero/tratamientos">Seguimiento</NavLink>
      </>
    );
  }
  if (rol === 'farmaceutico') {
    return <NavLink to="/farmaceutico/dispensacion">Dispensación</NavLink>;
  }
  if (rol === 'director' || rol === 'auditor') {
    return (
      <>
        <NavLink to="/admin/resumen">Resumen</NavLink>
        <NavLink to="/admin/usuarios">Usuarios</NavLink>
      </>
    );
  }
  return (
    <>
      <NavLink to="/turnos">Mis turnos</NavLink>
      <NavLink to="/historia-clinica">Historia clínica</NavLink>
      <NavLink to="/documentos">Documentos</NavLink>
      <NavLink to="/boveda-salud-mental">Bóveda salud mental</NavLink>
    </>
  );
}

export function Layout() {
  const { usuario, logout } = useAuth();

  return (
    <div className="layout">
      <header className="topbar">
        <span className="brand">
          <StarOfLifeIcon size={22} />
          <span className="brand-text">SaludYa</span>
        </span>
        <nav>
          <NavLink to="/" end>
            Inicio
          </NavLink>
          <NavLinksPorRol rol={usuario?.rol} />
          <NavLink to="/perfil">Perfil</NavLink>
        </nav>
        <div className="usuario-actual">
          <span>
            {usuario?.nombre} {usuario?.apellido}
          </span>
          <button onClick={logout}>Salir</button>
        </div>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
