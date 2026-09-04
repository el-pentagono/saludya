import { useState } from 'react';
import type { FormEvent } from 'react';
import { extraerMensajeError } from '../../api/errors';
import {
  buscarMenorPorDni,
  obtenerLibretaMenor,
  registrarAplicacionVacuna,
} from '../../api/vacunacion';
import { LibretaSanitaria } from '../../components/LibretaSanitaria';
import type { AplicacionVacuna, MenorEncontrado } from '../../types';

export function VacunacionPage() {
  const [dni, setDni] = useState('');
  const [menor, setMenor] = useState<MenorEncontrado | null>(null);
  const [libreta, setLibreta] = useState<AplicacionVacuna[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Registro inline de una dosis aplicada
  const [aplicacionEnCurso, setAplicacionEnCurso] = useState<AplicacionVacuna | null>(null);
  const [fechaAplicacion, setFechaAplicacion] = useState('');
  const [loteVacuna, setLoteVacuna] = useState('');
  const [lugarAplicacion, setLugarAplicacion] = useState('');
  const [notas, setNotas] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargarLibreta = async (menorId: string) => {
    const libretaData = await obtenerLibretaMenor(menorId);
    setLibreta(libretaData);
  };

  const onBuscar = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMensajeExito(null);
    setMenor(null);
    setLibreta([]);
    setBuscando(true);
    try {
      const encontrado = await buscarMenorPorDni(dni);
      setMenor(encontrado);
      await cargarLibreta(encontrado.id);
    } catch (err: unknown) {
      setError(extraerMensajeError(err, 'No se encontró un menor a cargo con ese DNI'));
    } finally {
      setBuscando(false);
    }
  };

  const onAbrirRegistro = (ap: AplicacionVacuna) => {
    setAplicacionEnCurso(ap);
    setFechaAplicacion(new Date().toISOString().slice(0, 10));
    setLoteVacuna('');
    setLugarAplicacion('');
    setNotas('');
  };

  const onSubmitRegistro = async (e: FormEvent) => {
    e.preventDefault();
    if (!aplicacionEnCurso || !menor) return;
    setError(null);
    setGuardando(true);
    try {
      await registrarAplicacionVacuna(aplicacionEnCurso.id, {
        fechaAplicacion: fechaAplicacion || undefined,
        loteVacuna: loteVacuna || undefined,
        lugarAplicacion: lugarAplicacion || undefined,
        notas: notas || undefined,
      });
      setMensajeExito(
        `Se registró la aplicación de ${aplicacionEnCurso.catalogoVacuna?.nombre} (${aplicacionEnCurso.catalogoVacuna?.dosis}) a ${menor.nombre}.`,
      );
      setAplicacionEnCurso(null);
      await cargarLibreta(menor.id);
    } catch (err: unknown) {
      setError(extraerMensajeError(err, 'No se pudo registrar la aplicación'));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div>
      <h1>Vacunación</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: '-0.5rem' }}>
        Buscá un menor por DNI para ver su Libreta Sanitaria Digital y registrar las dosis que le
        apliques. El registro impacta automáticamente en la libreta virtual de la familia.
      </p>

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

      <form className="inline-form" onSubmit={onBuscar}>
        <h2>Buscar menor por DNI</h2>
        {error && <p className="error">{error}</p>}
        <label>
          DNI del menor
          <input
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            placeholder="Ej: 45123456"
            required
          />
        </label>
        <button type="submit" disabled={buscando}>
          {buscando ? 'Buscando…' : 'Buscar'}
        </button>
      </form>

      {menor && (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid var(--color-border)',
            borderRadius: 10,
            padding: '1.5rem',
          }}
        >
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ margin: '0 0 0.25rem' }}>
              💉 {menor.nombre} {menor.apellido}
            </h2>
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
              DNI: <strong>{menor.dni}</strong>
              {menor.tutor && (
                <>
                  {' '}
                  · Tutor/a: <strong>{menor.tutor.nombre} {menor.tutor.apellido}</strong>
                </>
              )}
            </p>
          </div>

          <LibretaSanitaria
            aplicaciones={libreta}
            renderAccion={(ap) => (
              <button
                type="button"
                onClick={() => onAbrirRegistro(ap)}
                style={{
                  background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  padding: '0.4rem 0.85rem',
                  borderRadius: 6,
                }}
              >
                💉 Registrar aplicación
              </button>
            )}
          />
        </div>
      )}

      {aplicacionEnCurso && (
        <div className="modal-backdrop" onClick={() => setAplicacionEnCurso(null)}>
          <div
            className="modal-card"
            style={{ maxWidth: '480px', width: '90%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Registrar Aplicación</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
              {aplicacionEnCurso.catalogoVacuna?.nombre} — {aplicacionEnCurso.catalogoVacuna?.dosis}
              {menor && (
                <>
                  {' '}para <strong>{menor.nombre} {menor.apellido}</strong>
                </>
              )}
            </p>

            <form onSubmit={onSubmitRegistro}>
              <label>
                Fecha de aplicación
                <input
                  type="date"
                  value={fechaAplicacion}
                  onChange={(e) => setFechaAplicacion(e.target.value)}
                  max={new Date().toISOString().slice(0, 10)}
                  required
                />
              </label>

              <label>
                Lote de la vacuna (opcional)
                <input
                  type="text"
                  value={loteVacuna}
                  onChange={(e) => setLoteVacuna(e.target.value)}
                  placeholder="Ej: A123456"
                />
              </label>

              <label>
                Lugar de aplicación (opcional)
                <input
                  type="text"
                  value={lugarAplicacion}
                  onChange={(e) => setLugarAplicacion(e.target.value)}
                  placeholder="Ej: CAPS Norte, Hospital Central"
                />
              </label>

              <label>
                Notas (opcional)
                <textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Ej: reacción leve, control en 30 min"
                  rows={2}
                />
              </label>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="submit" disabled={guardando}>
                  {guardando ? 'Guardando…' : 'Confirmar aplicación'}
                </button>
                <button
                  type="button"
                  onClick={() => setAplicacionEnCurso(null)}
                  style={{ background: 'transparent', border: '1px solid var(--color-border)' }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
