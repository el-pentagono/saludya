import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { extraerMensajeError } from '../api/errors';
import {
  aceptarConsentimiento,
  crearMenor,
  eliminarMenor,
  listarMenores,
  obtenerConsentimiento,
} from '../api/family';
import type { ConsentimientoMenor, MenorACargo } from '../types';

export function FamilyPage() {
  const [cargando, setCargando] = useState(true);
  const [consentimiento, setConsentimiento] = useState<ConsentimientoMenor | null>(null);
  const [menores, setMenores] = useState<MenorACargo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Estado del consentimiento previo
  const [consentimientoAceptadoCheck, setConsentimientoAceptadoCheck] = useState(false);
  const [guardandoConsentimiento, setGuardandoConsentimiento] = useState(false);

  // Estado para modal de alta de menor
  const [modalAbierto, setModalAbierto] = useState(false);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [dni, setDni] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [relacion, setRelacion] = useState('madre');
  const [grupoSanguineo, setGrupoSanguineo] = useState('');
  const [alergias, setAlergias] = useState('');
  const [antecedentes, setAntecedentes] = useState('');
  const [pediatraCabecera, setPediatraCabecera] = useState('');

  // Documento de respaldo opcional
  const [documentoUrl, setDocumentoUrl] = useState<string | null>(null);
  const [documentoNombre, setDocumentoNombre] = useState('');
  const [documentoTipo, setDocumentoTipo] = useState('dni');

  const [guardandoMenor, setGuardandoMenor] = useState(false);

  const cargarDatos = async () => {
    setCargando(true);
    setError(null);
    try {
      const cons = await obtenerConsentimiento();
      setConsentimiento(cons);
      if (cons) {
        const lista = await listarMenores();
        setMenores(lista);
      }
    } catch (err: unknown) {
      setError(extraerMensajeError(err, 'No se pudo cargar la información familiar'));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const onAceptarConsentimiento = async (e: FormEvent) => {
    e.preventDefault();
    if (!consentimientoAceptadoCheck) return;
    setError(null);
    setGuardandoConsentimiento(true);
    try {
      const nuevoCons = await aceptarConsentimiento({
        textoAceptado:
          'Declaro ser el padre, madre o tutor legal con patria potestad sobre los menores que registre en SaludYa. Acepto expresamente el almacenamiento, confidencialidad y tratamiento de sus datos de salud con fines asistenciales y preventivos, conforme a la Ley 25.326 y las directrices de Google Play Store para familias y menores.',
        versionPolitica: '1.0',
      });
      setConsentimiento(nuevoCons);
      setMensajeExito('Consentimiento informado registrado correctamente.');
      const lista = await listarMenores();
      setMenores(lista);
    } catch (err: unknown) {
      setError(extraerMensajeError(err, 'Error al registrar el consentimiento'));
    } finally {
      setGuardandoConsentimiento(false);
    }
  };

  const calcularEdad = (fechaNacStr: string): number | null => {
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

  const edadActual = calcularEdad(fechaNacimiento);
  const esEdadInvalida = edadActual !== null && (edadActual >= 16 || edadActual < 0);

  const onArchivoSeleccionado = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDocumentoNombre(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setDocumentoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onSubmitCrearMenor = async (e: FormEvent) => {
    e.preventDefault();
    if (esEdadInvalida) return;
    setError(null);
    setGuardandoMenor(true);

    try {
      await crearMenor({
        nombre,
        apellido,
        dni,
        fechaNacimiento,
        relacion,
        grupoSanguineo: grupoSanguineo || undefined,
        alergias: alergias || undefined,
        antecedentes: antecedentes || undefined,
        pediatraCabecera: pediatraCabecera || undefined,
        documentoRespaldoUrl: documentoUrl || undefined,
        documentoRespaldoNombre: documentoNombre || undefined,
        documentoRespaldoTipo: documentoUrl ? documentoTipo : undefined,
      });

      setModalAbierto(false);
      setNombre('');
      setApellido('');
      setDni('');
      setFechaNacimiento('');
      setGrupoSanguineo('');
      setAlergias('');
      setAntecedentes('');
      setPediatraCabecera('');
      setDocumentoUrl(null);
      setDocumentoNombre('');
      setMensajeExito('Perfil del menor registrado con éxito.');
      cargarDatos();
    } catch (err: unknown) {
      setError(extraerMensajeError(err, 'No se pudo crear el perfil del menor'));
    } finally {
      setGuardandoMenor(false);
    }
  };

  const onEliminarMenor = async (id: string, nombreCompleto: string) => {
    if (!confirm(`¿Estás seguro de que deseás eliminar el perfil de ${nombreCompleto}?`)) return;
    setError(null);
    try {
      await eliminarMenor(id);
      setMensajeExito('Perfil eliminado.');
      setMenores((prev) => prev.filter((m) => m.id !== id));
    } catch (err: unknown) {
      setError(extraerMensajeError(err, 'No se pudo eliminar el perfil'));
    }
  };

  if (cargando) {
    return (
      <div>
        <h1>Mi familia</h1>
        <p>Cargando información familiar…</p>
      </div>
    );
  }

  // =========================================================================
  // PANTALLA 1: CONSENTIMIENTO EXPLÍCITO OBLIGATORIO (ANTES DEL PRIMER MENOR)
  // =========================================================================
  if (!consentimiento) {
    return (
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '1rem 0' }}>
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #bfdbfe',
            borderRadius: 12,
            padding: '2rem',
            boxShadow: '0 4px 12px rgba(30, 58, 138, 0.08)',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              background: '#eff6ff',
              color: '#1d4ed8',
              fontSize: '0.8rem',
              fontWeight: 700,
              padding: '0.3rem 0.75rem',
              borderRadius: 20,
              marginBottom: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            🛡 Cumplimiento Google Play Store y Ley de Protección de Datos Personales
          </div>

          <h1 style={{ margin: '0 0 1rem', color: '#1e3a8a', fontSize: '1.6rem' }}>
            Consentimiento Informado para la Gestión de Salud de Menores de 16 Años
          </h1>

          <p style={{ color: '#475569', lineHeight: '1.6', fontSize: '0.96rem' }}>
            Para garantizar la máxima protección de la privacidad infantil y dar cumplimiento a los
            estándares internacionales de Google Play Store para familias y niños, así como a la
            legislación de protección de datos de salud, <strong>es requisito indispensable</strong> que el
            padre, madre o tutor legal declare expresamente su consentimiento antes de registrar el perfil
            de cualquier hijo o menor a cargo.
          </p>

          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: '1.25rem',
              margin: '1.5rem 0',
              fontSize: '0.9rem',
              color: '#334155',
              lineHeight: '1.5',
            }}
          >
            <h3 style={{ margin: '0 0 0.5rem', color: '#0f172a' }}>Términos del Consentimiento:</h3>
            <ol style={{ paddingLeft: '1.25rem', margin: 0 }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong>Vínculo legal:</strong> Declaro bajo juramento ser madre, padre o tutor/a con
                patria potestad y representación jurídica sobre los menores que ingrese en esta cuenta.
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong>Finalidad médica y asistencial:</strong> Autorizo expresamente a SaludYa y a sus
                profesionales de salud habilitados a almacenar y procesar antecedentes clínicos, recetas,
                estudios y turnos para el seguimiento de la salud pediátrica del menor.
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong>Respaldo documental verificable:</strong> Entiendo que podré adjuntar en cualquier
                momento el DNI o partida de nacimiento del menor para reforzar la verificación del vínculo.
              </li>
              <li>
                <strong>Auditoría y revocación:</strong> Esta manifestación de consentimiento queda
                registrada de manera auditable con fecha y hora en los servidores seguros de la plataforma.
              </li>
            </ol>
          </div>

          {error && <p className="error">{error}</p>}

          <form onSubmit={onAceptarConsentimiento}>
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                cursor: 'pointer',
                marginBottom: '1.5rem',
                fontSize: '0.95rem',
                color: '#1e293b',
              }}
            >
              <input
                type="checkbox"
                checked={consentimientoAceptadoCheck}
                onChange={(e) => setConsentimientoAceptadoCheck(e.target.checked)}
                style={{ width: '18px', height: '18px', marginTop: '2px' }}
                required
              />
              <span>
                <strong>He leído y acepto expresamente</strong> los términos de consentimiento informado
                para la gestión de perfiles de salud de menores a mi cargo.
              </span>
            </label>

            <button
              type="submit"
              disabled={!consentimientoAceptadoCheck || guardandoConsentimiento}
              style={{
                background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                color: '#ffffff',
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 8,
                boxShadow: '0 2px 4px rgba(29, 78, 216, 0.25)',
                cursor: consentimientoAceptadoCheck ? 'pointer' : 'not-allowed',
                width: '100%',
              }}
            >
              {guardandoConsentimiento
                ? 'Registrando consentimiento…'
                : 'Aceptar consentimiento y continuar a Gestión Familiar →'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // PANTALLA 2: GESTIÓN FAMILIAR Y LISTADO DE MENORES A CARGO
  // =========================================================================
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        <div>
          <h1 style={{ margin: '0 0 0.25rem' }}>Mi familia</h1>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.92rem' }}>
            Gestión y seguimiento de salud de hijos y menores a cargo (&lt; 16 años)
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalAbierto(true)}
          style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            color: '#ffffff',
            fontWeight: 600,
            padding: '0.65rem 1.25rem',
            borderRadius: 8,
          }}
        >
          ＋ Agregar hijo/a menor
        </button>
      </div>

      <div
        style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: 8,
          padding: '0.65rem 1rem',
          marginBottom: '1.5rem',
          fontSize: '0.85rem',
          color: '#166534',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <span>
          ✓ <strong>Consentimiento informado activo:</strong> Registrado el{' '}
          {new Date(consentimiento.fechaAceptacion).toLocaleDateString('es-AR')} a las{' '}
          {new Date(consentimiento.fechaAceptacion).toLocaleTimeString('es-AR', {
            hour: '2-digit',
            minute: '2-digit',
          })}{' '}
          hs (Versión {consentimiento.versionPolitica}).
        </span>
        <span style={{ color: '#15803d', fontWeight: 600 }}>Auditoría Google Play Store OK</span>
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

      {menores.length === 0 ? (
        <div
          style={{
            padding: '2.5rem',
            textAlign: 'center',
            background: '#ffffff',
            border: '1px dashed var(--color-border)',
            borderRadius: 10,
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👶</div>
          <h3 style={{ margin: '0 0 0.5rem' }}>No tenés menores registrados</h3>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '480px', margin: '0 auto 1.25rem', fontSize: '0.92rem' }}>
            Agregá a tus hijos o menores bajo tu tutela para gestionar sus turnos pediátricos,
            consultar recetas, ver carnet de vacunación y mantener su historia clínica actualizada.
          </p>
          <button
            type="button"
            onClick={() => setModalAbierto(true)}
            style={{
              background: '#0284c7',
              color: '#ffffff',
              padding: '0.55rem 1.25rem',
              borderRadius: 6,
              fontWeight: 600,
            }}
          >
            Agregar mi primer hijo/a
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {menores.map((m) => {
            const edad = calcularEdad(m.fechaNacimiento);
            const esDocumentado = m.estadoVerificacion === 'documentado';

            return (
              <div
                key={m.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--color-border)',
                  borderRadius: 10,
                  padding: '1.25rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '0.75rem',
                    }}
                  >
                    <div>
                      <h3 style={{ margin: '0 0 0.2rem', color: 'var(--color-primary-dark)' }}>
                        {m.nombre} {m.apellido}
                      </h3>
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                        DNI: <strong>{m.dni}</strong> • {edad !== null ? `${edad} años` : '—'}
                      </span>
                    </div>

                    <span
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.2rem 0.55rem',
                        borderRadius: 12,
                        fontWeight: 600,
                        background: esDocumentado ? '#dcfce7' : '#fef3c7',
                        color: esDocumentado ? '#166534' : '#92400e',
                        border: esDocumentado ? '1px solid #86efac' : '1px solid #fcd34d',
                      }}
                      title={
                        esDocumentado
                          ? 'DNI o partida de nacimiento adjunta'
                          : 'Vínculo declarado por el tutor'
                      }
                    >
                      {esDocumentado ? '✓ Documentado' : 'Declarado'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '0.5rem' }}>
                    Vínculo:{' '}
                    <strong>
                      {m.relacion === 'madre'
                        ? 'Hijo/a (Madre)'
                        : m.relacion === 'padre'
                        ? 'Hijo/a (Padre)'
                        : 'Tutor Legal'}
                    </strong>
                    {m.grupoSanguineo && (
                      <span>
                        {' '}
                        • Grupo:{' '}
                        <strong style={{ color: '#dc2626' }}>{m.grupoSanguineo}</strong>
                      </span>
                    )}
                  </div>

                  {m.alergias && (
                    <div style={{ fontSize: '0.82rem', color: '#b91c1c', marginBottom: '0.5rem' }}>
                      ⚠️ Alergias: {m.alergias}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '1rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--color-border)',
                  }}
                >
                  <Link
                    to={`/mi-familia/${m.id}`}
                    style={{
                      color: 'var(--color-primary-dark)',
                      fontWeight: 600,
                      fontSize: '0.88rem',
                      textDecoration: 'none',
                    }}
                  >
                    Ver ficha clínica y turnos →
                  </Link>

                  <button
                    type="button"
                    onClick={() => onEliminarMenor(m.id, `${m.nombre} ${m.apellido}`)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#dc2626',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REGISTRO DE MENOR A CARGO (<16 AÑOS)                              */}
      {/* ========================================================================= */}
      {modalAbierto && (
        <div className="modal-backdrop" onClick={() => setModalAbierto(false)}>
          <div
            className="modal-card"
            style={{ maxWidth: '640px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
              }}
            >
              <h2 style={{ margin: 0, color: 'var(--color-primary-dark)' }}>
                Agregar Hijo/a o Menor a Cargo
              </h2>
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted)',
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={onSubmitCrearMenor}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '1rem',
                }}
              >
                <label>
                  Nombre del menor
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Sofía"
                    required
                  />
                </label>

                <label>
                  Apellido del menor
                  <input
                    type="text"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    placeholder="Ej. Benítez"
                    required
                  />
                </label>

                <label>
                  DNI del menor
                  <input
                    type="text"
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    placeholder="Ej. 54123987"
                    required
                  />
                </label>

                <label>
                  Fecha de nacimiento (&lt; 16 años)
                  <input
                    type="date"
                    value={fechaNacimiento}
                    onChange={(e) => setFechaNacimiento(e.target.value)}
                    max={new Date().toISOString().slice(0, 10)}
                    required
                  />
                  {edadActual !== null && (
                    <span
                      style={{
                        display: 'block',
                        fontSize: '0.8rem',
                        marginTop: '0.2rem',
                        fontWeight: 600,
                        color: esEdadInvalida ? '#dc2626' : '#15803d',
                      }}
                    >
                      {esEdadInvalida
                        ? `Edad calculada: ${edadActual} años. Solo se admiten menores de 16 años.`
                        : `Edad calculada: ${edadActual} años (Válido para gestión pediátrica)`}
                    </span>
                  )}
                </label>

                <label>
                  Vínculo con el menor
                  <select value={relacion} onChange={(e) => setRelacion(e.target.value)}>
                    <option value="madre">Madre</option>
                    <option value="padre">Padre</option>
                    <option value="tutor_legal">Tutor/a Legal</option>
                    <option value="otro">Otro representante legal</option>
                  </select>
                </label>

                <label>
                  Grupo sanguíneo (opcional)
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
              </div>

              <label style={{ marginTop: '0.75rem', display: 'block' }}>
                Alergias o intolerancias conocidas (opcional)
                <input
                  type="text"
                  value={alergias}
                  onChange={(e) => setAlergias(e.target.value)}
                  placeholder="Ej. Alergia a la penicilina, intolerancia a la lactosa"
                />
              </label>

              <label style={{ marginTop: '0.75rem', display: 'block' }}>
                Antecedentes pediátricos o diagnósticos previos (opcional)
                <textarea
                  value={antecedentes}
                  onChange={(e) => setAntecedentes(e.target.value)}
                  placeholder="Ej. Broncoespasmo a los 2 años, controles cardiológicos normales"
                  rows={2}
                />
              </label>

              <label style={{ marginTop: '0.75rem', display: 'block' }}>
                Pediatra o centro de salud de cabecera (opcional)
                <input
                  type="text"
                  value={pediatraCabecera}
                  onChange={(e) => setPediatraCabecera(e.target.value)}
                  placeholder="Ej. Dra. Laura Rossi (Hospital Materno Infantil de Tigre)"
                />
              </label>

              {/* Documento de respaldo: opcional, no bloqueante */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: 8,
                  padding: '1rem',
                  marginTop: '1.25rem',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.35rem' }}>
                  Documento de respaldo del vínculo (Opcional)
                </div>
                <p style={{ margin: '0 0 0.75rem', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                  Podés adjuntar foto o PDF del DNI del menor o partida de nacimiento. Este paso es un
                  plus verificable <strong>no bloqueante</strong>: podés crear el perfil ahora y
                  subirlo más adelante.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
                  <select
                    value={documentoTipo}
                    onChange={(e) => setDocumentoTipo(e.target.value)}
                    style={{ fontSize: '0.85rem' }}
                  >
                    <option value="dni">DNI (Frente o Dorso)</option>
                    <option value="partida_nacimiento">Partida de Nacimiento</option>
                    <option value="otro">Certificado de Tutela</option>
                  </select>

                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={onArchivoSeleccionado}
                    style={{ fontSize: '0.85rem' }}
                  />
                </div>

                {documentoNombre && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: '#166534' }}>
                    ✓ Archivo listo: <strong>{documentoNombre}</strong>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="submit"
                  disabled={guardandoMenor || esEdadInvalida}
                  style={{ flex: 1 }}
                >
                  {guardandoMenor ? 'Guardando…' : 'Guardar perfil del menor'}
                </button>
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
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
