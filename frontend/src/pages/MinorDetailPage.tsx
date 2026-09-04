import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { reservarTurno } from '../api/appointments';
import { extraerMensajeError } from '../api/errors';
import {
  actualizarSaludMenor,
  adjuntarDocumentoMenor,
  listarTurnosMenor,
  obtenerMenor,
} from '../api/family';
import { listarMedicos } from '../api/usuarios';
import { obtenerLibretaMenor, vincularTurnoVacuna } from '../api/vacunacion';
import { LibretaSanitaria } from '../components/LibretaSanitaria';
import type { AplicacionVacuna, Appointment, Medico, MenorACargo } from '../types';

export function MinorDetailPage() {
  const { menorId } = useParams<{ menorId: string }>();
  const location = useLocation();
  const [menor, setMenor] = useState<MenorACargo | null>(null);
  const [turnos, setTurnos] = useState<Appointment[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [libreta, setLibreta] = useState<AplicacionVacuna[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Formulario de edición clínica
  const [editandoClinica, setEditandoClinica] = useState(false);
  const [grupoSanguineo, setGrupoSanguineo] = useState('');
  const [alergias, setAlergias] = useState('');
  const [antecedentes, setAntecedentes] = useState('');
  const [pediatraCabecera, setPediatraCabecera] = useState('');
  const [guardandoClinica, setGuardandoClinica] = useState(false);

  // Carga de documento de respaldo
  const [docModalAbierto, setDocModalAbierto] = useState(false);
  const [docTipo, setDocTipo] = useState('dni');
  const [docUrl, setDocUrl] = useState<string | null>(null);
  const [docNombre, setDocNombre] = useState('');
  const [guardandoDoc, setGuardandoDoc] = useState(false);

  // Agendamiento de turno para el menor
  const [turnoModalAbierto, setTurnoModalAbierto] = useState(false);
  const [turnoMedicoId, setTurnoMedicoId] = useState('');
  const [turnoFecha, setTurnoFecha] = useState('');
  const [turnoMotivo, setTurnoMotivo] = useState('');
  const [guardandoTurno, setGuardandoTurno] = useState(false);
  // Si el turno se abrió desde "Sacar turno" de una dosis de la libreta, guardamos cuál
  // para vincular el turno recién creado a esa dosis específica.
  const [aplicacionParaTurno, setAplicacionParaTurno] = useState<AplicacionVacuna | null>(null);

  const cargarLibreta = async (id: string) => {
    try {
      const libretaData = await obtenerLibretaMenor(id);
      setLibreta(libretaData);
      return libretaData;
    } catch {
      setLibreta([]);
      return [];
    }
  };

  const cargar = async () => {
    if (!menorId) return;
    setCargando(true);
    setError(null);
    try {
      const data = await obtenerMenor(menorId);
      setMenor(data);
      setGrupoSanguineo(data.grupoSanguineo || '');
      setAlergias(data.alergias || '');
      setAntecedentes(data.antecedentes || '');
      setPediatraCabecera(data.pediatraCabecera || '');

      const turnosData = await listarTurnosMenor(menorId);
      setTurnos(turnosData);

      const medicosData = await listarMedicos();
      setMedicos(medicosData);

      const libretaData = await cargarLibreta(menorId);

      // Si llegamos desde el botón "Sacar turno" de una notificación de vacunación,
      // abrimos directamente el modal de turno prefiltrado para esa dosis.
      const aplicacionIdSolicitada = (location.state as { abrirTurnoParaAplicacion?: string } | null)
        ?.abrirTurnoParaAplicacion;
      if (aplicacionIdSolicitada) {
        const ap = libretaData.find((a) => a.id === aplicacionIdSolicitada);
        if (ap) {
          onSacarTurnoParaVacuna(ap);
        }
      }
    } catch (err: unknown) {
      setError(extraerMensajeError(err, 'No se pudo cargar la ficha del menor'));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menorId]);

  const onSacarTurnoParaVacuna = (ap: AplicacionVacuna) => {
    setAplicacionParaTurno(ap);
    setTurnoMotivo(`Vacunación: ${ap.catalogoVacuna?.nombre} (${ap.catalogoVacuna?.dosis})`.trim());
    setTurnoMedicoId('');
    setTurnoFecha('');
    setTurnoModalAbierto(true);
  };

  const calcularEdad = (fechaNacStr?: string): number | null => {
    if (!fechaNacStr) return null;
    const nac = new Date(`${fechaNacStr}T00:00:00`);
    if (isNaN(nac.getTime())) return null;
    const hoy = new Date();
    let edad = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) {
      edad--;
    }
    return edad;
  };

  const onGuardarClinica = async (e: FormEvent) => {
    e.preventDefault();
    if (!menorId) return;
    setError(null);
    setGuardandoClinica(true);
    try {
      const updated = await actualizarSaludMenor(menorId, {
        grupoSanguineo: grupoSanguineo || undefined,
        alergias: alergias || undefined,
        antecedentes: antecedentes || undefined,
        pediatraCabecera: pediatraCabecera || undefined,
      });
      setMenor(updated);
      setEditandoClinica(false);
      setMensajeExito('Ficha de salud pediátrica actualizada correctamente.');
    } catch (err: unknown) {
      setError(extraerMensajeError(err, 'Error al actualizar la ficha clínica'));
    } finally {
      setGuardandoClinica(false);
    }
  };

  const onArchivoDocSeleccionado = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocNombre(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setDocUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onSubmitAdjuntarDoc = async (e: FormEvent) => {
    e.preventDefault();
    if (!menorId || !docUrl) return;
    setError(null);
    setGuardandoDoc(true);
    try {
      const updated = await adjuntarDocumentoMenor(menorId, {
        documentoUrl: docUrl,
        nombreArchivo: docNombre || 'documento-respaldo',
        tipoDocumento: docTipo,
      });
      setMenor(updated);
      setDocModalAbierto(false);
      setDocUrl(null);
      setDocNombre('');
      setMensajeExito('Documento de respaldo adjuntado exitosamente. Vínculo documentado.');
    } catch (err: unknown) {
      setError(extraerMensajeError(err, 'No se pudo adjuntar el documento'));
    } finally {
      setGuardandoDoc(false);
    }
  };

  const onCerrarModalTurno = () => {
    setTurnoModalAbierto(false);
    setAplicacionParaTurno(null);
    setTurnoMotivo('');
  };

  const onSubmitAgendarTurno = async (e: FormEvent) => {
    e.preventDefault();
    if (!menorId || !turnoMedicoId || !turnoFecha) return;
    setError(null);
    setGuardandoTurno(true);
    try {
      const turno = await reservarTurno({
        medicoId: turnoMedicoId,
        menorId,
        fecha: new Date(turnoFecha).toISOString(),
        motivo: `[Pediátrico - ${menor?.nombre} ${menor?.apellido}] ${turnoMotivo || 'Control pediátrico'}`,
      });

      if (aplicacionParaTurno) {
        try {
          await vincularTurnoVacuna(aplicacionParaTurno.id, turno.id);
        } catch {
          // El turno ya quedó reservado igual; solo falló el vínculo visual con la libreta
        }
      }

      setTurnoModalAbierto(false);
      setTurnoMedicoId('');
      setTurnoFecha('');
      setTurnoMotivo('');
      setMensajeExito(
        aplicacionParaTurno
          ? 'Turno de vacunación reservado con éxito.'
          : 'Turno pediátrico reservado con éxito.',
      );
      setAplicacionParaTurno(null);
      const turnosData = await listarTurnosMenor(menorId);
      setTurnos(turnosData);
      await cargarLibreta(menorId);
    } catch (err: unknown) {
      setError(extraerMensajeError(err, 'No se pudo reservar el turno'));
    } finally {
      setGuardandoTurno(false);
    }
  };

  if (cargando) {
    return (
      <div>
        <p>Cargando ficha del menor…</p>
      </div>
    );
  }

  if (!menor) {
    return (
      <div>
        <p className="error">{error || 'No se encontró el perfil del menor'}</p>
        <Link to="/mi-familia">← Volver a Mi Familia</Link>
      </div>
    );
  }

  const edad = calcularEdad(menor.fechaNacimiento);
  const esDocumentado = menor.estadoVerificacion === 'documentado';

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <Link
          to="/mi-familia"
          style={{ textDecoration: 'none', color: 'var(--color-primary-dark)', fontWeight: 600 }}
        >
          ← Volver a Mi Familia
        </Link>
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

      {/* Cabecera del menor */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid var(--color-border)',
          borderRadius: 12,
          padding: '1.5rem',
          marginBottom: '1.5rem',
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#0284c7',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Ficha Pediátrica Infantil (&lt;16 años)
            </span>
            <h1 style={{ margin: '0.2rem 0 0.4rem', color: 'var(--color-primary-dark)' }}>
              {menor.nombre} {menor.apellido}
            </h1>
            <div style={{ fontSize: '0.92rem', color: 'var(--color-text-muted)' }}>
              DNI: <strong>{menor.dni}</strong> • Nacimiento:{' '}
              <strong>{new Date(`${menor.fechaNacimiento}T00:00:00`).toLocaleDateString('es-AR')}</strong>{' '}
              ({edad !== null ? `${edad} años` : '—'}) • Vínculo:{' '}
              <strong style={{ textTransform: 'capitalize' }}>{menor.relacion.replace('_', ' ')}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '0.82rem',
                padding: '0.35rem 0.75rem',
                borderRadius: 20,
                fontWeight: 600,
                background: esDocumentado ? '#dcfce7' : '#fef3c7',
                color: esDocumentado ? '#166534' : '#92400e',
                border: esDocumentado ? '1px solid #86efac' : '1px solid #fcd34d',
                alignSelf: 'center',
              }}
            >
              {esDocumentado ? '✓ Vínculo Documentado' : '🟡 Vínculo Declarado'}
            </span>

            <button
              type="button"
              onClick={() => setTurnoModalAbierto(true)}
              style={{
                background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
                color: '#ffffff',
                fontWeight: 600,
                padding: '0.5rem 1rem',
                borderRadius: 6,
              }}
            >
              📅 Agendar turno pediátrico
            </button>
          </div>
        </div>

        {/* Resumen clínico en grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginTop: '1.25rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--color-border)',
            fontSize: '0.9rem',
          }}
        >
          <div>
            <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.8rem' }}>
              Grupo Sanguíneo:
            </span>
            <strong style={{ color: menor.grupoSanguineo ? '#dc2626' : 'inherit' }}>
              {menor.grupoSanguineo || 'No informado'}
            </strong>
          </div>

          <div>
            <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.8rem' }}>
              Alergias o Intolerancias:
            </span>
            <strong>{menor.alergias || 'Sin alergias registradas'}</strong>
          </div>

          <div>
            <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.8rem' }}>
              Pediatra de Cabecera:
            </span>
            <strong>{menor.pediatraCabecera || 'No asignado'}</strong>
          </div>

          <div>
            <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.8rem' }}>
              Documento de Respaldo:
            </span>
            {menor.documentoRespaldoUrl ? (
              <span style={{ color: '#166534', fontWeight: 600 }}>
                {menor.documentoRespaldoNombre || 'Documento adjunto'}
              </span>
            ) : (
              <span style={{ color: '#92400e' }}>Sin adjuntar (opcional)</span>
            )}
          </div>
        </div>
      </div>

      {/* Grid de 2 columnas: Ficha clínica editable y Documentación de respaldo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Columna 1: Datos de salud y antecedentes */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid var(--color-border)',
            borderRadius: 10,
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 style={{ margin: 0 }}>Antecedentes e Información Médica</h3>
            <button
              type="button"
              onClick={() => setEditandoClinica(!editandoClinica)}
              style={{
                background: 'transparent',
                border: '1px solid var(--color-border)',
                padding: '0.3rem 0.65rem',
                fontSize: '0.82rem',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              {editandoClinica ? 'Cancelar' : '✏️ Editar'}
            </button>
          </div>

          {editandoClinica ? (
            <form onSubmit={onGuardarClinica}>
              <label>
                Grupo sanguíneo
                <select
                  value={grupoSanguineo}
                  onChange={(e) => setGrupoSanguineo(e.target.value)}
                >
                  <option value="">Desconocido / A definir</option>
                  <option value="0+">0+</option>
                  <option value="0-">0-</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </label>

              <label>
                Alergias o intolerancias
                <input
                  type="text"
                  value={alergias}
                  onChange={(e) => setAlergias(e.target.value)}
                  placeholder="Ej: Penicilina, polen, mariscos"
                />
              </label>

              <label>
                Antecedentes pediátricos
                <textarea
                  value={antecedentes}
                  onChange={(e) => setAntecedentes(e.target.value)}
                  placeholder="Ej: Cirugías, internaciones, tratamientos crónicos"
                  rows={2}
                />
              </label>

              <label>
                Pediatra de cabecera
                <input
                  type="text"
                  value={pediatraCabecera}
                  onChange={(e) => setPediatraCabecera(e.target.value)}
                  placeholder="Ej: Dr. Gómez (Hospital Central)"
                />
              </label>

              <button type="submit" disabled={guardandoClinica} style={{ marginTop: '0.75rem' }}>
                {guardandoClinica ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </form>
          ) : (
            <div style={{ fontSize: '0.9rem', lineHeight: '1.6', color: '#334155' }}>
              <p>
                <strong>Antecedentes pediátricos:</strong>{' '}
                {menor.antecedentes || 'Sin antecedentes relevantes registrados.'}
              </p>
              <p>
                <strong>Alergias:</strong> {menor.alergias || 'Ninguna conocida.'}
              </p>
              <p>
                <strong>Pediatra habitual:</strong> {menor.pediatraCabecera || 'No asignado aún.'}
              </p>
            </div>
          )}
        </div>

        {/* Columna 2: Verificación de vínculo y documento */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid var(--color-border)',
            borderRadius: 10,
            padding: '1.25rem',
          }}
        >
          <h3 style={{ margin: '0 0 0.5rem' }}>Documentación de Respaldo</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: '0 0 1rem' }}>
            El DNI del menor o partida de nacimiento certifica formalmente la patria potestad. Es un
            plus de verificación no bloqueante.
          </p>

          {menor.documentoRespaldoUrl ? (
            <div>
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #86efac',
                  borderRadius: 8,
                  padding: '1rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <div style={{ fontSize: '1.5rem' }}>📄</div>
                <div>
                  <div style={{ fontWeight: 600, color: '#166534', fontSize: '0.9rem' }}>
                    {menor.documentoRespaldoNombre || 'Documento de respaldo'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#15803d' }}>
                    Tipo: {menor.documentoRespaldoTipo?.toUpperCase() || 'DOCUMENTO'} • Verificado
                  </div>
                </div>
              </div>

              {/* Si es una imagen Data URI, previsualizarla */}
              {menor.documentoRespaldoUrl.startsWith('data:image') && (
                <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                  <img
                    src={menor.documentoRespaldoUrl}
                    alt="Documento de respaldo"
                    style={{ maxHeight: '160px', maxWidth: '100%', borderRadius: 6, border: '1px solid #e2e8f0' }}
                  />
                </div>
              )}

              <button
                type="button"
                onClick={() => setDocModalAbierto(true)}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.85rem',
                  padding: '0.4rem 0.85rem',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                Reemplazar documento
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                Todavía no se adjuntó un documento de respaldo para {menor.nombre}.
              </p>
              <button
                type="button"
                onClick={() => setDocModalAbierto(true)}
                style={{
                  background: '#0284c7',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  padding: '0.45rem 1rem',
                  borderRadius: 6,
                }}
              >
                ＋ Subir DNI o Partida de Nacimiento
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sección 3: Turnos médicos del menor */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h2 style={{ margin: 0 }}>Turnos médicos de {menor.nombre}</h2>
          <button
            type="button"
            onClick={() => setTurnoModalAbierto(true)}
            style={{
              background: '#0284c7',
              color: '#ffffff',
              padding: '0.4rem 0.85rem',
              fontSize: '0.85rem',
              borderRadius: 6,
            }}
          >
            ＋ Nuevo turno
          </button>
        </div>

        {turnos.length === 0 ? (
          <div style={{ background: '#ffffff', border: '1px solid var(--color-border)', borderRadius: 8, padding: '1.5rem', textAlign: 'center' }}>
            <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              No hay turnos registrados específicamente para este menor.
            </p>
          </div>
        ) : (
          <table className="tabla">
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Profesional Médico</th>
                <th>Motivo</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {turnos.map((t) => (
                <tr key={t.id}>
                  <td>{new Date(t.fecha).toLocaleString('es-AR')}</td>
                  <td>{t.medico ? `Dr/a. ${t.medico.nombre} ${t.medico.apellido}` : '—'}</td>
                  <td>{t.motivo || 'Control pediátrico'}</td>
                  <td>
                    <span className={`badge badge-${t.estado}`}>{t.estado}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Sección 4: Libreta Sanitaria Digital (vacunación) */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid var(--color-border)',
          borderRadius: 10,
          padding: '1.5rem',
        }}
      >
        <h2 style={{ margin: '0 0 0.5rem' }}>💉 Libreta Sanitaria Digital</h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', margin: '0 0 1.25rem' }}>
          Esquema de vacunación de {menor.nombre} según el Calendario Nacional de Vacunación. Las
          dosis se marcan automáticamente como aplicadas cuando el pediatra las registra.
        </p>

        <LibretaSanitaria
          aplicaciones={libreta}
          renderAccion={(ap) => (
            <button
              type="button"
              onClick={() => onSacarTurnoParaVacuna(ap)}
              style={{
                background: ap.urgencia === 'atrasada' ? '#dc2626' : '#0284c7',
                color: '#ffffff',
                fontSize: '0.82rem',
                padding: '0.4rem 0.85rem',
                borderRadius: 6,
              }}
            >
              📅 Sacar turno para vacunación
            </button>
          )}
        />
      </div>

      {/* Modal: Subir o reemplazar documento de respaldo */}
      {docModalAbierto && (
        <div className="modal-backdrop" onClick={() => setDocModalAbierto(false)}>
          <div
            className="modal-card"
            style={{ maxWidth: '500px', width: '90%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Adjuntar Documento de Respaldo</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Subí una foto o PDF del DNI del menor o de su partida de nacimiento para certificar el
              vínculo parental.
            </p>

            <form onSubmit={onSubmitAdjuntarDoc}>
              <label>
                Tipo de documento
                <select value={docTipo} onChange={(e) => setDocTipo(e.target.value)}>
                  <option value="dni">DNI del menor</option>
                  <option value="partida_nacimiento">Partida de Nacimiento</option>
                  <option value="otro">Certificado de Tutela Legal</option>
                </select>
              </label>

              <label>
                Seleccionar archivo (imagen o PDF)
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={onArchivoDocSeleccionado}
                  required
                />
              </label>

              {docNombre && (
                <p style={{ fontSize: '0.82rem', color: '#166534', margin: '0.5rem 0' }}>
                  ✓ Archivo seleccionado: <strong>{docNombre}</strong>
                </p>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="submit" disabled={guardandoDoc || !docUrl}>
                  {guardandoDoc ? 'Guardando…' : 'Subir documento'}
                </button>
                <button
                  type="button"
                  onClick={() => setDocModalAbierto(false)}
                  style={{ background: 'transparent', border: '1px solid var(--color-border)' }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Agendar turno pediátrico (o de vacunación) para el menor */}
      {turnoModalAbierto && (
        <div className="modal-backdrop" onClick={onCerrarModalTurno}>
          <div
            className="modal-card"
            style={{ maxWidth: '520px', width: '90%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>{aplicacionParaTurno ? 'Sacar Turno para Vacunación' : 'Agendar Turno Pediátrico'}</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
              Para el menor: <strong>{menor.nombre} {menor.apellido}</strong>
              {aplicacionParaTurno && (
                <>
                  {' '}· Dosis: <strong>{aplicacionParaTurno.catalogoVacuna?.nombre} ({aplicacionParaTurno.catalogoVacuna?.dosis})</strong>
                </>
              )}
            </p>

            <form onSubmit={onSubmitAgendarTurno}>
              <label>
                Médico o Pediatra
                <select
                  value={turnoMedicoId}
                  onChange={(e) => setTurnoMedicoId(e.target.value)}
                  required
                >
                  <option value="">Seleccioná un profesional</option>
                  {medicos.map((m) => (
                    <option key={m.id} value={m.id}>
                      Dr/a. {m.nombre} {m.apellido}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Fecha y hora del turno
                <input
                  type="datetime-local"
                  value={turnoFecha}
                  onChange={(e) => setTurnoFecha(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  required
                />
              </label>

              <label>
                Motivo de consulta (opcional)
                <input
                  type="text"
                  value={turnoMotivo}
                  onChange={(e) => setTurnoMotivo(e.target.value)}
                  placeholder="Ej: Control de crecimiento, fiebre, dolor de garganta"
                />
              </label>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="submit" disabled={guardandoTurno}>
                  {guardandoTurno ? 'Reservando…' : 'Confirmar turno'}
                </button>
                <button
                  type="button"
                  onClick={onCerrarModalTurno}
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
