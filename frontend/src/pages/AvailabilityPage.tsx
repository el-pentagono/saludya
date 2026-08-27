import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  crearBloqueDisponibilidad,
  eliminarBloqueDisponibilidad,
  listarMisBloquesDisponibilidad,
} from '../api/availability';
import { extraerMensajeError } from '../api/errors';
import type { BloqueDisponibilidad } from '../types';

const DIAS_SEMANA = [
  { id: 1, nombre: 'Lunes' },
  { id: 2, nombre: 'Martes' },
  { id: 3, nombre: 'Miércoles' },
  { id: 4, nombre: 'Jueves' },
  { id: 5, nombre: 'Viernes' },
  { id: 6, nombre: 'Sábado' },
  { id: 0, nombre: 'Domingo' },
];

export function AvailabilityPage() {
  const [bloques, setBloques] = useState<BloqueDisponibilidad[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Form state
  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState<'recurrente' | 'puntual'>('recurrente');
  const [diaSemana, setDiaSemana] = useState(1);
  const [fechaPuntual, setFechaPuntual] = useState('');
  const [horaInicio, setHoraInicio] = useState('09:00');
  const [horaFin, setHoraFin] = useState('13:00');
  const [guardando, setGuardando] = useState(false);

  const cargar = () => {
    setCargando(true);
    listarMisBloquesDisponibilidad()
      .then(setBloques)
      .catch((err: unknown) => setError(extraerMensajeError(err, 'No se pudo cargar tu disponibilidad')))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargar();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMensajeExito(null);
    setGuardando(true);

    try {
      await crearBloqueDisponibilidad({
        titulo,
        esRecurrente: tipo === 'recurrente',
        diaSemana: tipo === 'recurrente' ? diaSemana : undefined,
        fechaPuntual: tipo === 'puntual' ? fechaPuntual : undefined,
        horaInicio,
        horaFin,
      });

      setTitulo('');
      setMensajeExito('Bloque de tiempo guardado exitosamente.');
      cargar();
    } catch (err) {
      setError(extraerMensajeError(err, 'Error al guardar el bloque'));
    } finally {
      setGuardando(false);
    }
  };

  const onEliminar = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseás eliminar este bloque?')) return;
    setError(null);
    try {
      await eliminarBloqueDisponibilidad(id);
      setMensajeExito('Bloque eliminado.');
      setBloques((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo eliminar el bloque'));
    }
  };

  const getNombreDia = (dia: number | null) => {
    if (dia === null || dia === undefined) return '—';
    const d = DIAS_SEMANA.find((item) => item.id === dia);
    return d ? d.nombre : '—';
  };

  return (
    <div>
      <h1>Mi Disponibilidad y Horarios Personales</h1>

      <div
        style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
          border: '1px solid #bfdbfe',
          borderRadius: 10,
          padding: '1.25rem',
          marginBottom: '1.75rem',
          color: '#1e3a8a',
        }}
      >
        <h3 style={{ margin: '0 0 0.4rem', color: '#1e40af' }}>
          Tu tiempo personal es prioritario
        </h3>
        <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: '1.5', color: '#334155' }}>
          Marcá acá tus horarios ocupados o dedicados a tu vida cotidiana (trabajo, clases,
          trámites o cuidado familiar). El sistema de SaludYa y tus médicos los respetarán
          automáticamente al sugerirte y programarte turnos.
        </p>
      </div>

      {mensajeExito && (
        <div
          style={{
            background: '#dcfce7',
            border: '1px solid #86efac',
            color: '#166534',
            padding: '0.75rem 1rem',
            borderRadius: 8,
            marginBottom: '1rem',
          }}
        >
          {mensajeExito}
        </div>
      )}

      {error && <p className="error">{error}</p>}

      {/* Formulario de nuevo bloque */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid var(--color-border)',
          borderRadius: 10,
          padding: '1.25rem',
          marginBottom: '2rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Agregar nuevo bloque ocupado</h2>

        <form onSubmit={onSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <label>
              Motivo o actividad
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej. Trabajo en oficina, Facultad, Gimnasio"
                required
              />
            </label>

            <label>
              Frecuencia
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as 'recurrente' | 'puntual')}
              >
                <option value="recurrente">Todas las semanas (Fijo)</option>
                <option value="puntual">Fecha específica (Única vez)</option>
              </select>
            </label>

            {tipo === 'recurrente' ? (
              <label>
                Día de la semana
                <select
                  value={diaSemana}
                  onChange={(e) => setDiaSemana(Number(e.target.value))}
                >
                  {DIAS_SEMANA.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nombre}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <label>
                Fecha
                <input
                  type="date"
                  value={fechaPuntual}
                  onChange={(e) => setFechaPuntual(e.target.value)}
                  min={new Date().toISOString().slice(0, 10)}
                  required
                />
              </label>
            )}

            <label>
              Desde las
              <input
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                required
              />
            </label>

            <label>
              Hasta las
              <input
                type="time"
                value={horaFin}
                onChange={(e) => setHoraFin(e.target.value)}
                required
              />
            </label>
          </div>

          <div style={{ marginTop: '1.25rem' }}>
            <button type="submit" disabled={guardando}>
              {guardando ? 'Guardando…' : 'Guardar bloque de tiempo'}
            </button>
          </div>
        </form>
      </div>

      {/* Lista de bloques registrados */}
      <h2>Mis bloques de tiempo ocupado</h2>

      {cargando ? (
        <p>Cargando disponibilidad…</p>
      ) : bloques.length === 0 ? (
        <div
          style={{
            padding: '2rem',
            textAlign: 'center',
            background: 'var(--color-bg)',
            borderRadius: 8,
            border: '1px dashed var(--color-border)',
          }}
        >
          <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
            No tenés bloques de tiempo ocupado registrados. Agregá tus horarios laborales o
            personales para que los turnos sugeridos nunca coincidan con ellos.
          </p>
        </div>
      ) : (
        <table className="tabla">
          <thead>
            <tr>
              <th>Actividad</th>
              <th>Frecuencia</th>
              <th>Día / Fecha</th>
              <th>Horario</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {bloques.map((b) => (
              <tr key={b.id}>
                <td>
                  <strong>{b.titulo}</strong>
                </td>
                <td>
                  <span className="badge badge-en_espera">
                    {b.esRecurrente ? 'Semanal' : 'Puntual'}
                  </span>
                </td>
                <td>
                  {b.esRecurrente
                    ? `Todos los ${getNombreDia(b.diaSemana)}`
                    : b.fechaPuntual
                    ? new Date(`${b.fechaPuntual}T00:00:00`).toLocaleDateString('es-AR')
                    : '—'}
                </td>
                <td>
                  {b.horaInicio} hs — {b.horaFin} hs
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    type="button"
                    onClick={() => onEliminar(b.id)}
                    style={{
                      background: 'transparent',
                      color: 'var(--color-danger, #dc2626)',
                      border: '1px solid #fca5a5',
                      padding: '0.3rem 0.65rem',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      borderRadius: 6,
                    }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
