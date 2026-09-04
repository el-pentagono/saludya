import { useEffect, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  contarNotificacionesNoLeidas,
  listarNotificaciones,
  marcarNotificacionLeida,
  marcarTodasNotificacionesLeidas,
} from '../api/notifications';
import type { Notification } from '../types';

export function NotificationBell() {
  const [notificaciones, setNotificaciones] = useState<Notification[]>([]);
  const [conteoNoLeidas, setConteoNoLeidas] = useState<number>(0);
  const [abierto, setAbierto] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const cargar = async () => {
    try {
      const [lista, conteo] = await Promise.all([
        listarNotificaciones(),
        contarNotificacionesNoLeidas(),
      ]);
      setNotificaciones(lista);
      setConteoNoLeidas(conteo);
    } catch {
      // Ignora errores si la sesión o el backend no responde
    }
  };

  useEffect(() => {
    cargar();
    const timer = setInterval(cargar, 20000);
    return () => clearInterval(timer);
  }, []);

  // Cierra el dropdown al hacer click afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAbierto(false);
      }
    }
    if (abierto) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [abierto]);

  const marcarLeidaLocal = async (notif: Notification) => {
    if (notif.leida) return;
    try {
      await marcarNotificacionLeida(notif.id);
      setNotificaciones((prev) => prev.map((n) => (n.id === notif.id ? { ...n, leida: true } : n)));
      setConteoNoLeidas((c) => Math.max(0, c - 1));
    } catch {
      // Ignora
    }
  };

  const esNotificacionVacuna = (tipo: string) => tipo.startsWith('vacuna_');

  const onMarcarLeida = async (notif: Notification) => {
    await marcarLeidaLocal(notif);
    setAbierto(false);
    if (notif.tipo.startsWith('estudio_') || notif.tipo.startsWith('receta_')) {
      navigate('/recetas');
    } else if (esNotificacionVacuna(notif.tipo) && notif.metadata?.menorId) {
      navigate(`/mi-familia/${notif.metadata.menorId}`);
    }
  };

  // Acceso directo desde la alerta: marca como leída, va a la libreta del menor y
  // abre el modal de turno ya prefiltrado para esa dosis puntual.
  const onSacarTurnoDesdeNotificacion = async (
    e: ReactMouseEvent,
    notif: Notification,
  ) => {
    e.stopPropagation();
    await marcarLeidaLocal(notif);
    setAbierto(false);
    if (!notif.metadata?.menorId) return;
    navigate(`/mi-familia/${notif.metadata.menorId}`, {
      state: { abrirTurnoParaAplicacion: notif.metadata.aplicacionId },
    });
  };

  const onMarcarTodas = async () => {
    try {
      await marcarTodasNotificacionesLeidas();
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
      setConteoNoLeidas(0);
    } catch {
      // Ignora
    }
  };

  return (
    <div className="notif-container" ref={dropdownRef}>
      <button
        type="button"
        className="notif-trigger"
        onClick={() => {
          setAbierto(!abierto);
          if (!abierto) cargar();
        }}
        title="Notificaciones del sistema"
      >
        <span>🔔</span>
        {conteoNoLeidas > 0 && <span className="notif-badge">{conteoNoLeidas}</span>}
      </button>

      {abierto && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <h4>Notificaciones</h4>
            {conteoNoLeidas > 0 && (
              <button type="button" onClick={onMarcarTodas}>
                Marcar todas leídas
              </button>
            )}
          </div>
          <ul className="notif-list">
            {notificaciones.length === 0 ? (
              <li className="notif-vacia">No tenés notificaciones pendientes.</li>
            ) : (
              notificaciones.map((n) => (
                <li
                  key={n.id}
                  className={`notif-item ${!n.leida ? 'no-leida' : ''}`}
                  onClick={() => onMarcarLeida(n)}
                >
                  <div className="notif-titulo">
                    {!n.leida && '● '}
                    {n.titulo}
                  </div>
                  <p className="notif-mensaje">{n.mensaje}</p>
                  <span className="notif-fecha">
                    {new Date(n.fechaCreacion).toLocaleString('es-AR', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </span>
                  {(n.tipo === 'vacuna_proxima' || n.tipo === 'vacuna_atrasada') &&
                    n.metadata?.menorId && (
                      <button
                        type="button"
                        onClick={(e) => onSacarTurnoDesdeNotificacion(e, n)}
                        style={{
                          display: 'block',
                          marginTop: '0.5rem',
                          background: n.tipo === 'vacuna_atrasada' ? '#dc2626' : '#0284c7',
                          color: '#ffffff',
                          fontSize: '0.78rem',
                          padding: '0.35rem 0.7rem',
                          borderRadius: 6,
                        }}
                      >
                        📅 Sacar turno para vacunación
                      </button>
                    )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
