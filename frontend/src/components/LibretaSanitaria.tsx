import type { ReactNode } from 'react';
import type { AplicacionVacuna } from '../types';

const ETIQUETA_URGENCIA: Record<AplicacionVacuna['urgencia'], string> = {
  aplicada: '✓ Aplicada',
  atrasada: '⚠ Atrasada',
  proxima: '🔔 Próxima',
  pendiente: 'Pendiente',
};

function formatearFecha(fechaISO: string): string {
  return new Date(`${fechaISO}T00:00:00`).toLocaleDateString('es-AR');
}

interface LibretaSanitariaProps {
  aplicaciones: AplicacionVacuna[];
  /** Acción disponible para una dosis pendiente/próxima/atrasada sin turno vinculado todavía */
  renderAccion?: (aplicacion: AplicacionVacuna) => ReactNode;
}

export function LibretaSanitaria({ aplicaciones, renderAccion }: LibretaSanitariaProps) {
  if (aplicaciones.length === 0) {
    return (
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
        Todavía no hay un esquema de vacunación generado.
      </p>
    );
  }

  return (
    <ul className="lista-entradas" style={{ margin: 0 }}>
      {aplicaciones.map((ap) => {
        const vacuna = ap.catalogoVacuna;
        const esPendiente = ap.estado === 'pendiente';
        return (
          <li
            key={ap.id}
            style={
              ap.urgencia === 'atrasada'
                ? { borderLeft: '3px solid #dc2626' }
                : ap.urgencia === 'proxima'
                  ? { borderLeft: '3px solid #d97706' }
                  : undefined
            }
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <div>
                <strong>{vacuna?.nombre ?? 'Vacuna'}</strong>
                <span style={{ color: 'var(--color-text-muted)' }}> — {vacuna?.dosis}</span>
              </div>
              <span className={`badge badge-${ap.urgencia}`}>{ETIQUETA_URGENCIA[ap.urgencia]}</span>
            </div>

            {ap.estado === 'aplicada' ? (
              <p className="detalle" style={{ margin: '0.4rem 0 0' }}>
                Aplicada el {formatearFecha(ap.fechaAplicacion!)}
                {ap.lugarAplicacion ? ` en ${ap.lugarAplicacion}` : ''}
                {ap.loteVacuna ? ` · Lote ${ap.loteVacuna}` : ''}
                {ap.medicoAplicador ? ` · Dr/a. ${ap.medicoAplicador.nombre} ${ap.medicoAplicador.apellido}` : ''}
              </p>
            ) : (
              <p className="detalle" style={{ margin: '0.4rem 0 0' }}>
                Corresponde el {formatearFecha(ap.fechaProgramada)}
              </p>
            )}

            {esPendiente && ap.appointmentId && (
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: '#166534', fontWeight: 600 }}>
                📅 Ya tenés un turno agendado para esta dosis.
              </p>
            )}

            {esPendiente && !ap.appointmentId && renderAccion && (
              <div style={{ marginTop: '0.6rem' }}>{renderAccion(ap)}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
