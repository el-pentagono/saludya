import { useEffect, useState } from 'react';
import { dispensarTratamiento, listarTratamientos } from '../../api/treatments';
import { extraerMensajeError } from '../../api/errors';
import type { Treatment } from '../../types';

export function DispensingPage() {
  const [tratamientos, setTratamientos] = useState<Treatment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dispensandoId, setDispensandoId] = useState<string | null>(null);

  const cargar = () => {
    listarTratamientos()
      .then(setTratamientos)
      .catch(() => setTratamientos([]));
  };

  useEffect(() => {
    cargar();
  }, []);

  const onDispensar = async (id: string) => {
    setError(null);
    setDispensandoId(id);
    try {
      await dispensarTratamiento(id);
      cargar();
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo dispensar el tratamiento'));
    } finally {
      setDispensandoId(null);
    }
  };

  return (
    <div>
      <h1>Dispensación de tratamientos</h1>
      {error && <p className="error">{error}</p>}

      <table className="tabla">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Paciente</th>
            <th>Medicamento</th>
            <th>Dosis</th>
            <th>Indicaciones</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {tratamientos.map((t) => (
            <tr key={t.id}>
              <td>{new Date(t.fechaCreacion).toLocaleDateString('es-AR')}</td>
              <td>{t.paciente ? `${t.paciente.nombre} ${t.paciente.apellido}` : '—'}</td>
              <td>{t.medicamento}</td>
              <td>{t.dosis}</td>
              <td>{t.indicaciones ?? '—'}</td>
              <td>
                <span className={`badge badge-${t.estado}`}>{t.estado}</span>
              </td>
              <td>
                {t.estado === 'prescrito' && (
                  <button disabled={dispensandoId === t.id} onClick={() => onDispensar(t.id)}>
                    {dispensandoId === t.id ? 'Dispensando…' : 'Dispensar'}
                  </button>
                )}
              </td>
            </tr>
          ))}
          {tratamientos.length === 0 && (
            <tr>
              <td colSpan={7}>No hay tratamientos cargados.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
