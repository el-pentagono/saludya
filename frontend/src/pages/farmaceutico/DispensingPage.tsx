import { useEffect, useState } from 'react';
import { extraerMensajeError } from '../../api/errors';
import { dispensarTratamiento, listarTratamientos } from '../../api/treatments';
import type { Treatment } from '../../types';

export function DispensingPage() {
  const [tratamientos, setTratamientos] = useState<Treatment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [dispensandoId, setDispensandoId] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroTab, setFiltroTab] = useState<'pendientes' | 'entregadas' | 'todas'>('pendientes');

  const cargar = () => {
    listarTratamientos()
      .then(setTratamientos)
      .catch(() => setTratamientos([]));
  };

  useEffect(() => {
    cargar();
  }, []);

  const onDispensar = async (t: Treatment) => {
    setError(null);
    setMensajeExito(null);
    setDispensandoId(t.id);
    try {
      await dispensarTratamiento(t.id);
      setMensajeExito(
        `Receta de "${t.medicamento}" marcada como entregada. El estado se actualizó automáticamente en la app del paciente.`,
      );
      cargar();
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo marcar la receta como entregada'));
    } finally {
      setDispensandoId(null);
    }
  };

  // Filtrado de recetas
  const query = busqueda.trim().toLowerCase();
  const tratamientosFiltrados = tratamientos.filter((t) => {
    // Filtro por pestaña
    if (filtroTab === 'pendientes' && t.estado !== 'prescrito') return false;
    if (filtroTab === 'entregadas' && t.estado !== 'dispensado') return false;

    // Filtro por búsqueda de texto
    if (!query) return true;
    const nombrePaciente = t.paciente
      ? `${t.paciente.nombre} ${t.paciente.apellido}`.toLowerCase()
      : '';
    const medicamento = t.medicamento.toLowerCase();
    const id = t.id.toLowerCase();
    return nombrePaciente.includes(query) || medicamento.includes(query) || id.includes(query);
  });

  const pendientesCount = tratamientos.filter((t) => t.estado === 'prescrito').length;

  return (
    <div>
      <h1>Farmacia Hospitalaria — Dispensación de Recetas</h1>
      {error && <p className="error">{error}</p>}
      {mensajeExito && (
        <div
          style={{
            background: '#ecfdf5',
            color: '#065f46',
            border: '1px solid #a7f3d0',
            padding: '0.75rem 1rem',
            borderRadius: 8,
            marginBottom: '1rem',
            fontSize: '0.9rem',
          }}
        >
          ✓ {mensajeExito}
        </div>
      )}

      {/* Buscador de recetas por paciente */}
      <div style={{ marginBottom: '1.25rem' }}>
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="🔍 Buscar por nombre de paciente, medicamento o código de receta..."
          style={{ fontSize: '0.95rem', padding: '0.65rem 1rem' }}
        />
      </div>

      {/* Pestañas de estado */}
      <div className="tabs-nav">
        <button
          type="button"
          className={`tab-btn ${filtroTab === 'pendientes' ? 'active' : ''}`}
          onClick={() => setFiltroTab('pendientes')}
        >
          Pendientes de retirar ({pendientesCount})
        </button>
        <button
          type="button"
          className={`tab-btn ${filtroTab === 'entregadas' ? 'active' : ''}`}
          onClick={() => setFiltroTab('entregadas')}
        >
          Historial de entregadas
        </button>
        <button
          type="button"
          className={`tab-btn ${filtroTab === 'todas' ? 'active' : ''}`}
          onClick={() => setFiltroTab('todas')}
        >
          Todas ({tratamientos.length})
        </button>
      </div>

      <table className="tabla">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Paciente</th>
            <th>Medicamento</th>
            <th>Dosis & Cantidad</th>
            <th>Cobertura</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {tratamientosFiltrados.map((t) => {
            const esPendiente = t.estado === 'prescrito';
            return (
              <tr key={t.id}>
                <td>{new Date(t.fechaCreacion).toLocaleDateString('es-AR')}</td>
                <td>
                  <strong>{t.paciente ? `${t.paciente.nombre} ${t.paciente.apellido}` : '—'}</strong>
                </td>
                <td>
                  <strong>{t.medicamento}</strong>
                  {t.indicaciones && (
                    <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      {t.indicaciones}
                    </span>
                  )}
                </td>
                <td>
                  <div>{t.dosis}</div>
                  <small style={{ color: 'var(--color-primary-dark)', fontWeight: 600 }}>
                    Cant: {t.cantidad || '1 unidad'}
                  </small>
                </td>
                <td>
                  {t.esGratuita !== false ? (
                    <span className="badge badge-gratuita">Gratuita / Hospital</span>
                  ) : (
                    <span className="badge">Con Obra Social</span>
                  )}
                </td>
                <td>
                  <span className={`badge ${esPendiente ? 'badge-pendiente' : 'badge-entregada'}`}>
                    {esPendiente ? 'Pendiente' : 'Entregada'}
                  </span>
                  {!esPendiente && t.fechaDispensa && (
                    <small style={{ display: 'block', color: 'var(--color-text-subtle)', fontSize: '0.75rem' }}>
                      {new Date(t.fechaDispensa).toLocaleDateString('es-AR')}
                    </small>
                  )}
                </td>
                <td>
                  {esPendiente && (
                    <button
                      disabled={dispensandoId === t.id}
                      onClick={() => onDispensar(t)}
                      style={{ background: '#059669', fontSize: '0.85rem' }}
                    >
                      {dispensandoId === t.id ? 'Entregando…' : '✓ Marcar como entregada'}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
          {tratamientosFiltrados.length === 0 && (
            <tr>
              <td colSpan={7}>
                {query
                  ? 'No se encontraron recetas con el criterio de búsqueda.'
                  : filtroTab === 'pendientes'
                    ? 'No hay recetas pendientes de retirar en este momento.'
                    : 'No hay recetas en esta vista.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
