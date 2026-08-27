import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarOrdenesEstudio } from '../api/studyOrders';
import { listarTratamientos } from '../api/treatments';
import type { StudyOrder, Treatment } from '../types';

export function PrescriptionsPage() {
  const [activeTab, setActiveTab] = useState<'recetas' | 'estudios'>('recetas');
  const [tratamientos, setTratamientos] = useState<Treatment[]>([]);
  const [estudios, setEstudios] = useState<StudyOrder[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargar = async () => {
    setCargando(true);
    try {
      const [tList, eList] = await Promise.all([
        listarTratamientos(),
        listarOrdenesEstudio(),
      ]);
      setTratamientos(tList);
      setEstudios(eList);
    } catch {
      // Ignora
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const pendientes = tratamientos.filter((t) => t.estado === 'prescrito');
  const entregadas = tratamientos.filter((t) => t.estado === 'dispensado');

  return (
    <div>
      <h1>Mis recetas y órdenes de estudio</h1>

      <div className="tabs-nav">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'recetas' ? 'active' : ''}`}
          onClick={() => setActiveTab('recetas')}
        >
          Recetas Digitales ({pendientes.length} pendientes)
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'estudios' ? 'active' : ''}`}
          onClick={() => setActiveTab('estudios')}
        >
          Órdenes de Estudio ({estudios.length})
        </button>
      </div>

      {cargando ? (
        <p>Cargando información médica…</p>
      ) : activeTab === 'recetas' ? (
        <div>
          {/* SECCIÓN 1: PENDIENTES DE RETIRAR */}
          <h2>Pendientes de retirar en farmacia</h2>
          {pendientes.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)' }}>
              No tenés recetas pendientes de retirar en este momento.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <div className="aviso-farmacia">
                ℹ <strong>Indicaciones de retiro:</strong> Acercate a la ventanilla de Farmacia Hospitalaria con tu DNI para retirar tu medicación.
              </div>

              {pendientes.map((t) => (
                <div key={t.id} className="tarjeta-item" style={{ borderLeft: '4px solid #0089a8' }}>
                  <div className="tarjeta-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h3 className="tarjeta-titulo">{t.medicamento}</h3>
                      {t.esGratuita !== false && (
                        <span className="badge badge-gratuita">Gratuita / Hospital</span>
                      )}
                    </div>
                    <span className="badge badge-pendiente">Pendiente de retirar</span>
                  </div>

                  <div style={{ fontSize: '0.9rem', color: 'var(--color-text)' }}>
                    <strong>Dosis:</strong> {t.dosis} &nbsp;|&nbsp; <strong>Cantidad:</strong> {t.cantidad || '1 unidad'}
                  </div>

                  {t.indicaciones && (
                    <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                      <strong>Indicaciones:</strong> {t.indicaciones}
                    </p>
                  )}

                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)', marginTop: '0.25rem' }}>
                    Prescrito el {new Date(t.fechaCreacion).toLocaleDateString('es-AR')}
                    {t.medico && ` por Dr/a. ${t.medico.nombre} ${t.medico.apellido}`}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SECCIÓN 2: HISTORIAL DE ENTREGADAS */}
          <h2>Historial de recetas entregadas</h2>
          {entregadas.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)' }}>No hay recetas entregadas en tu historial.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {entregadas.map((t) => (
                <div key={t.id} className="tarjeta-item" style={{ background: '#fafafa' }}>
                  <div className="tarjeta-header">
                    <h3 className="tarjeta-titulo" style={{ fontSize: '0.95rem' }}>
                      {t.medicamento}
                    </h3>
                    <span className="badge badge-entregada">Entregada</span>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    {t.dosis} — Cantidad: {t.cantidad || '1 unidad'}
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)' }}>
                    Entregada en farmacia el{' '}
                    {t.fechaDispensa ? new Date(t.fechaDispensa).toLocaleDateString('es-AR') : '—'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* SECCIÓN 3: ÓRDENES DE ESTUDIO */
        <div>
          <h2>Tus estudios médicos programados</h2>
          {estudios.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)' }}>No tenés órdenes de estudio cargadas.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {estudios.map((o) => {
                const esRealizado = o.estado === 'realizado';
                return (
                  <div
                    key={o.id}
                    className="tarjeta-item"
                    style={{
                      borderLeft: esRealizado ? '4px solid #10b981' : '4px solid #f59e0b',
                    }}
                  >
                    <div className="tarjeta-header">
                      <h3 className="tarjeta-titulo">{o.tipoEstudio}</h3>
                      <span className={`badge ${esRealizado ? 'badge-realizado' : 'badge-pendiente'}`}>
                        {esRealizado ? 'Realizado' : 'Pendiente de realización'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.9rem' }}>
                      <strong>Lugar:</strong> {o.lugar}
                      <br />
                      <strong>Fecha y hora del estudio:</strong>{' '}
                      {new Date(o.fechaSugerida).toLocaleString('es-AR', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </div>

                    {o.indicaciones && (
                      <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                        <strong>Preparación / Indicaciones:</strong> {o.indicaciones}
                      </p>
                    )}

                    {esRealizado && o.fechaControlSugerida && (
                      <div
                        style={{
                          background: '#ecfdf5',
                          border: '1px solid #a7f3d0',
                          padding: '0.75rem',
                          borderRadius: 8,
                          marginTop: '0.5rem',
                        }}
                      >
                        <div style={{ color: '#065f46', fontWeight: 600, fontSize: '0.9rem' }}>
                          ✓ ¡Estudio realizado! Se sugiere turno de control con el médico para el{' '}
                          {new Date(o.fechaControlSugerida).toLocaleDateString('es-AR')}.
                        </div>
                        <Link
                          to="/turnos"
                          style={{
                            display: 'inline-block',
                            marginTop: '0.5rem',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                          }}
                        >
                          → Solicitar turno de control
                        </Link>
                      </div>
                    )}

                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)', marginTop: '0.25rem' }}>
                      Orden emitida el {new Date(o.fechaCreacion).toLocaleDateString('es-AR')}
                      {o.medico && ` por Dr/a. ${o.medico.nombre} ${o.medico.apellido}`}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
