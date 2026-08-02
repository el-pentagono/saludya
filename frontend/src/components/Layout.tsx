import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Layout() {
  const { usuario, logout } = useAuth();
  const esMedico = usuario?.rol === 'medico';

  return (
    <div className="layout">
      <header className="topbar">
        <span className="brand">SaludYa</span>
        <nav>
          <NavLink to="/" end>
            Inicio
          </NavLink>
          {esMedico ? (
            <>
              <NavLink to="/medico/agenda">Mi agenda</NavLink>
              <NavLink to="/medico/tratamientos">Tratamientos</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/turnos">Mis turnos</NavLink>
              <NavLink to="/historia-clinica">Historia clínica</NavLink>
              <NavLink to="/documentos">Documentos</NavLink>
            </>
          )}
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
