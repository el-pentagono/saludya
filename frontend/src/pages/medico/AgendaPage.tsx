import { Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarTurnos } from '../../api/appointments';
import { cerrarTurnoExpress } from '../../api/cierreExpress';
import { extraerMensajeError } from '../../api/errors';
import { obtenerSalaTeleconsult } from '../../api/teleconsult';
import type { Appointment } from '../../types';

export function AgendaPage() {
  const [turnos, setTurnos] = useState<Appointment[]>([]);
  const [cerrandoId, setCerrandoId] = useState<string | null>(null);
  const [diagnostico, setDiagnostico] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const cargar = () => {
    listarTurnos()
      .then(setTurnos)
      .catch(() => setTurnos([]));
  };

  useEffect(() => {
    cargar();
  }, []);

  const abrirCierre = (id: string) => {
    setCerrandoId(id);
    setDiagnostico('');
    setError(null);
  };

  const confirmarCierre = async (id: string) => {
    setError(null);
    setEnviando(true);
    try {
      await cerrarTurnoExpress(id, diagnostico);
      setCerrandoId(null);
      cargar();
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo cerrar el turno'));
    } finally {
      setEnviando(false);
    }
  };

  const onUnirseVideollamada = async (id: string) => {
    setError(null);
    try {
      const { salaUrl } = await obtenerSalaTeleconsult(id);
      window.open(salaUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo obtener la sala de videollamada'));
    }
  };

  return (
    <div>
      <h1>Mi agenda</h1>
      {error && <p className="error">{error}</p>}

      <table className="tabla">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Paciente</th>
            <th>Motivo</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {turnos.map((t) => (
            <Fragment key={t.id}>
              <tr>
                <td>{new Date(t.fecha).toLocaleString('es-AR')}</td>
                <td>{t.paciente ? `${t.paciente.nombre} ${t.paciente.apellido}` : '—'}</td>
                <td>{t.motivo ?? '—'}</td>
                <td>
                  <span className={`badge badge-${t.estado}`}>{t.estado}</span>
                </td>
                <td className="acciones">
                  {t.estado === 'pendiente' && (
                    <>
                      <button onClick={() => onUnirseVideollamada(t.id)}>Videollamada</button>
                      <button onClick={() => abrirCierre(t.id)}>Cerrar turno</button>
                      <Link to={`/medico/pacientes/${t.pacienteId}/historia-clinica`}>
                        Historia clínica
                      </Link>
                      <Link to={`/medico/pacientes/${t.pacienteId}/prescribir`}>Prescribir</Link>
                      <Link to={`/medico/pacientes/${t.pacienteId}/boveda-salud-mental`}>
                        Bóveda salud mental
                      </Link>
                      <Link to={`/medico/turnos/${t.id}/transcripcion`}>Transcripción IA</Link>
                    </>
                  )}
                </td>
              </tr>
              {cerrandoId === t.id && (
                <tr>
                  <td colSpan={5}>
                    <div className="cierre-inline">
                      <label>
                        Diagnóstico breve
                        <input
                          value={diagnostico}
                          onChange={(e) => setDiagnostico(e.target.value)}
                          autoFocus
                        />
                      </label>
                      <div className="cierre-inline-botones">
                        <button disabled={enviando} onClick={() => confirmarCierre(t.id)}>
                          {enviando ? 'Cerrando…' : 'Confirmar cierre'}
                        </button>
                        <button type="button" onClick={() => setCerrandoId(null)}>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
          {turnos.length === 0 && (
            <tr>
              <td colSpan={5}>No tenés turnos en tu agenda.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
