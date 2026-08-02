import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function NavLinksPorRol({ rol }: { rol: string | undefined }) {
  if (rol === 'medico') {
    return (
      <>
        <NavLink to="/medico/agenda">Mi agenda</NavLink>
        <NavLink to="/medico/tratamientos">Tratamientos</NavLink>
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
    </>
  );
}

export function Layout() {
  const { usuario, logout } = useAuth();

  return (
    <div className="layout">
      <header className="topbar">
        <span className="brand">SaludYa</span>
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
